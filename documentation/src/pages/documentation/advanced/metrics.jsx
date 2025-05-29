import metricsGif from '../../../images/metrics.gif';

export default function Metrics() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Metrics</h1>

      <div className="mb-8">
        <p className="mb-4">
          Installation metrics allow monitoring release activity via the CLI. For detailed usage
          instructions, please refer to the{' '}
          <a href="/documentation/sdk/integration" className="text-dota-600 hover:underline">
            CLI documentation
          </a>
          .
        </p>
        <p className="mb-4">Redis is required for Metrics to work.</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Setup</h2>

        <ol className="list-decimal pl-6 space-y-4 mb-6">
          <li>
            <p>
              Install Redis by following{' '}
              <a
                href="https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/"
                className="text-dota-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                official installation guide
              </a>
              .
            </p>
          </li>
          <li>
            <p>
              TLS is required. Follow{' '}
              <a
                href="https://redis.io/docs/latest/operate/oss_and_stack/management/security/encryption/#running-manually"
                className="text-dota-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                official Redis TLS run guide
              </a>
              .
            </p>
          </li>
          <li>
            <p>
              Set the necessary environment variables for{' '}
              <a href="/configuration/environment" className="text-dota-600 hover:underline">
                Redis
              </a>
              :
            </p>
            <pre className="code-block">
              <code>{`# Redis Configuration
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_TLS=true`}</code>
            </pre>
          </li>
        </ol>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Available Metrics</h2>

        <p className="mb-4">Once configured, DOTA will collect the following metrics:</p>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border px-4 py-2 text-left">Metric</th>
                <th className="border px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">Bundle Downloads</td>
                <td className="border px-4 py-2">
                  Number of times each bundle has been downloaded by client devices
                </td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border px-4 py-2">Bundle Installations</td>
                <td className="border px-4 py-2">
                  Number of successful installations of each bundle
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Installation Failures</td>
                <td className="border px-4 py-2">Count of failed installations with error types</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border px-4 py-2">Active Users</td>
                <td className="border px-4 py-2">
                  Number of unique devices that have connected to DOTA
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Rollbacks</td>
                <td className="border px-4 py-2">Number of unique devices that have rolled back to a previous version</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Accessing Metrics</h2>

        <p className="mb-4">
          You can access metrics directly through the DOTA CLI or DOTA Dashboard.
        </p>

        <h3 className="text-xl font-semibold mb-3 mt-6">Via CLI</h3>
        <p className="mb-4">
          You can also access release metrics directly from your terminal using the DOTA CLI:
        </p>
        <pre className="code-block mb-4">
          <code>{`npx dota metrics <org>/<app> <deployment> <label> <targetVersion>`}</code>
        </pre>
        <p className="mb-4">
          <strong>Example:</strong>
        </p>
        <pre className="code-block mb-4">
          <code>{`npx dota metrics organization-one/app-one "Deployment One" v1 1.0.0`}</code>
        </pre>
        <p className="mb-4">
          This will output:
        </p>
        <pre className="code-block mb-4">
          <code>{`Metrics for organization-one/app-one [Deployment One] label: v1, target version: 1.0.0
  Rollout:   100%
  Adoption:  0.00% (0 of 0 installs)
  Rollbacks: 0.00% (0 of 0 installs)`}</code>
        </pre>

        <h3 className="text-xl font-semibold mb-3 mt-6">Via Dashboard</h3>
        <p className="mb-4">
          Navigate to your bucket in the DOTA Dashboard and select the "Metrics" tab to view
          graphical representations of your release performance.
        </p>
        
        <div className="border rounded-lg overflow-hidden mb-6">
          <img 
            src={metricsGif} 
            alt="DOTA Metrics Dashboard" 
            className="w-full" 
          />
        </div>
      </div>

      <div className="alert-tip mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="alert-icon"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
        <div className="alert-content">
          <strong>Best Practice:</strong>
          <p>
            Regularly review metrics to understand adoption rates and identify potential issues with
            your releases. This information can help guide your deployment strategy.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Advanced Redis Configuration</h2>

        <p className="mb-4">
          For production environments, consider the following Redis optimizations:
        </p>

        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Deploy Redis with replication for high availability</li>
          <li>Configure persistence to prevent data loss during restarts</li>
          <li>Implement proper memory limits to avoid out-of-memory issues</li>
          <li>Set an appropriate key eviction policy</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">Example Redis Configuration</h3>
        <pre className="code-block">
          <code>{`# Sample redis.conf settings for DOTA metrics
maxmemory 1gb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
save 900 1
save 300 10
save 60 10000`}</code>
        </pre>
      </div>
    </div>
  );
}
