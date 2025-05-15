import { OAuth2Client, TokenPayload } from "google-auth-library";
import * as cookieSession from "cookie-session";
import { Request, Response, Router, RequestHandler } from "express";
import * as storage from "../storage/storage";
import rateLimit from "express-rate-limit";
import { sendErrorToDatadog } from "../utils/tracer";

// Replace with your actual Google Client ID (from Google Developer Console)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "<Your Google Client ID>";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface AuthenticationConfig {
  storage: storage.Storage;
}

export class Authentication {
  private _cookieSessionMiddleware: RequestHandler;
  private _serverUrl: string;
  private _storageInstance: storage.Storage;

  constructor(config: AuthenticationConfig) {
    this._serverUrl = process.env["SERVER_URL"];

    // Session middleware setup
    this._cookieSessionMiddleware = cookieSession({
      httpOnly: true,
      ttl: 3600000, // One hour in milliseconds
      name: "oauth.session",
      path: "/",
      signed: false,
      overwrite: true,
    });

    this._storageInstance = config.storage;
  }

  // Validate the Google ID token received from the client or web dashboard
  public async verifyGoogleToken(idToken: string): Promise<TokenPayload> {
    try {
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: GOOGLE_CLIENT_ID, // Make sure this matches the client ID used in your app
      });

      const payload = ticket.getPayload();
      return payload; // Return the user info from Google token
    } catch (error) {
      sendErrorToDatadog(new Error("401: Unauthorised Invalid Google Token"));
      throw new Error("Invalid Google token");
    }
  }

  public async getOrCreateUser(payload: TokenPayload): Promise<storage.Account> {
    try {
      return await this._storageInstance.getAccountByEmail(payload.email);
    } catch (e) {
      await this._storageInstance.addAccount({
        createdTime: Date.now(),
        email: payload.email,
        name: payload.name,
      });
      return await this._storageInstance.getAccountByEmail(payload.email);
    }
  }

  public async getUserById(userId: string): Promise<storage.Account> {
    try {
      return await this._storageInstance.getAccount(userId);
    } catch (e) {
      sendErrorToDatadog(new Error("403: User Not found"));
      throw new Error("No User found");
    }
  }

  // Middleware to authenticate requests using Google ID token
  public async authenticate(req: Request, res: Response, next: (err?: Error) => void) {
    // Bypass authentication in development mode
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      let token = req.headers.authorization?.split("Bearer ")[1];
      if (!token) {
        const userId = Array.isArray(req.headers.userid) ? req.headers.userid[0] : req.headers.userid;
        if (userId) {
            const user = await this.getUserById(userId);
            if (user) {
                req.user = {
                  id: userId
                };
                return next();
            } else {
                return res.status(401).send("User not found");    
            }
        } else {
            return res.status(401).send("Missing token and userid");
        }
      }
      
      // Handle mock Google token for development - directly use LOCAL_GOOGLE_TOKEN
      if (token === "mock-google-token") {
        try {
          // First check if LOCAL_GOOGLE_TOKEN environment variable is set
          if (process.env.LOCAL_GOOGLE_TOKEN) {
            const user = await this._storageInstance.getUserFromAccessToken(process.env.LOCAL_GOOGLE_TOKEN);
            if (user) {
              req.user = { id: user.id };
              return next();
            }
          } else {
            // If LOCAL_GOOGLE_TOKEN is not set
            console.log("LOCAL_GOOGLE_TOKEN is not set");
            return next();
          }
        } catch (error) {
          console.error("Error authenticating with mock Google token:", error);
          // Continue to standard authentication methods if mock authentication fails
        }
      }
      
      // Handle CLI access tokens
      if (token.startsWith("cli-")) {
        token = token.split("cli-")[1];
        try {
          // Use the storage mechanism to look up the token, just like in production
          const user = await this._storageInstance.getUserFromAccessToken(token);
          if (user) {
            req.user = user;
            return next();
          } else {
            // For expired or invalid tokens, return 401
            return res.status(401).send("Access key has expired or is invalid");
          }
        } catch (error) {
          // If there's an error looking up the token, return 401
          return res.status(401).send("Invalid Access token");
        }
      }
      
      // For regular Google JWT tokens in development mode, verify them
      try {
        // Verify Google ID token
        const payload = await this.verifyGoogleToken(token);
        if (!payload) {
          return res.status(401).send("Invalid Google ID token");
        }

        // Get or create user
        const user = await this.getOrCreateUser(payload);
        if (!user) {
          return res.status(401).send("User not found in the system");
        } else {
          // Update user info if it has changed
          if (user.name !== payload.name) {
            user.name = payload.name;
            await this._storageInstance.addAccount(user);
          }
        }

        // Attach the user to the request object
        req.user = user;
        return next();
      } catch (error) {
        console.error("Error verifying Google token in development:", error);
        return res.status(401).send("Authentication failed: " + error.message);
      }
    }

    // In production, validate the Google ID token
    try {
      const idToken = req.headers.authorization?.split("Bearer ")[1];
      if (!idToken) {
        const userId = Array.isArray(req.headers.userid) ? req.headers.userid[0] : req.headers.userid;
        if (userId) {
            const user = await this.getUserById(userId);
            if (user) {
                req.user = {
                  id: userId
                };
                return next();
            } else {
                return res.status(401).send("User not found");    
            }
        } else {
            return res.status(401).send("Missing Google ID token");
        }
      }

      // Handle mock-google-token in production if Google credentials are missing
      if (idToken === "mock-google-token" && 
          (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)) {
        try {
          if (process.env.LOCAL_GOOGLE_TOKEN) {
            const user = await this._storageInstance.getUserFromAccessToken(process.env.LOCAL_GOOGLE_TOKEN);
            if (user) {
              req.user = { id: user.id };
              return next();
            }
          } else {
            // If LOCAL_GOOGLE_TOKEN is not set, create a dummy user
            const dummyUser = {
              id: "mock-user-id",
              email: "mock@example.com",
              name: "Mock User",
              createdTime: Date.now(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            // Check if the dummy user already exists
            try {
              req.user = await this._storageInstance.getAccountByEmail(dummyUser.email);
            } catch (e) {
              // If the user doesn't exist, create a new one
              await this._storageInstance.addAccount(dummyUser);
              req.user = dummyUser;
            }
            
            return next();
          }
        } catch (error) {
          console.error("Error authenticating with mock token in production:", error);
        }
      }

      if (idToken.startsWith("cli-")) {
        // Handle CLI access with access key
          const accessToken = idToken.split("cli-")[1];
          const user = await this._storageInstance.getUserFromAccessToken(accessToken);
          if(user) {
            req.user = { id: user.id };
            return next();
          } else {
            return res.status(401).send("Authentication failed by access key");
          }
      } else {
          // Verify Google ID token
          const payload = await this.verifyGoogleToken(idToken);
          if (!payload) {
            return res.status(401).send("Invalid Google ID token");
          }

          // Check user exists in the storage
          const userEmail = payload.email;

          const user = await this.getOrCreateUser(payload);

          if (!user) {
            return res.status(401).send("User not found in the system");
          } else {
            // Update user info if it has changed
            if (user.name !== payload.name) {
              user.name = payload.name;
              await this._storageInstance.addAccount(user);
            }
          }

          // Attach the user to the request object
          req.user = user;
          next();
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      res.status(401).send("Authentication failed: " + error.message);
    }
  }

  // Main router for handling requests
  public getRouter(): Router {
    const router: Router = Router();

    router.use(this._cookieSessionMiddleware);

    // Example protected route
    router.get(
      "/authenticated",
      rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }),
      this.authenticate.bind(this),
      (req: Request, res: Response) => {
        res.send({ authenticated: true, user: req.user });
      }
    );

    return router;
  }
}
