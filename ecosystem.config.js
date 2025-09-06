module.exports = {
    apps: [
        {
            name: "api",
            script: "build/index.js",
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
