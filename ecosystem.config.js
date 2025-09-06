module.exports = {
    apps: [
        {
            name: "api",
            script: "build/index.js",
            cwd: "/root/api/current",
            instances: "max",
            exec_mode: "cluster",
            env_production: {
                NODE_ENV: "production",
            },
            output: "logs/out.log",
            error: "logs/error.log"
        }
    ]
}
