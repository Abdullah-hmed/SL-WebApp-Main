module.exports = {
    apps: [
      {
        name: "frontend",
        cwd: "./Frontend",
        script: "npm",
        args: "run dev",
        watch: true
      },
      {
        name: "backend",
        cwd: "./Backend",
        script: "node",
        args: "server.js",
        watch: true
      },
      {
        name: "flask-backend",
        cwd: "./Flask-Backend",
        script: "python",
        args: "webapp.py",
        watch: true
      }
    ]
};