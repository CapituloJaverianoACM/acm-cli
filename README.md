# 🚀 ACM CLI

CLI for manipulating data used on the website and managing users. Make sure to be added first by the Super User ([acm@javeriana.edu.co](mailto\:acm@javeriana.edu.co)).

## ✅ **Prerequisites**

Before using this CLI, ensure you have the following installed:

- [Bun](https://bun.sh/) (Required for package management and building the project)
- [Node.js](https://nodejs.org/) (Recommended version: LTS)
- [Git](https://git-scm.com/) (For cloning the repository)

## 📥 **Installation**

Since this CLI will not be published on npm, you need to clone the repository and link it globally using `npm link`. Follow these steps:

### **1️⃣ Clone the repository**

```sh
git clone https://github.com/CapituloJaverianoACM/acm-cli.git
cd acm-cli
```

### **2️⃣ Install dependencies using Bun**

```sh
bun install
```

### **3️⃣ Build the project**

```sh
bun run build
```

### **4️⃣ Link the CLI globally**

Run the following command inside the project folder:

```sh
npm link
```

This will create a global symlink, allowing you to use the CLI anywhere on your system.

### **5️⃣ Verify installation**

To confirm that the CLI is correctly installed, run:

```sh
acm-cli
```

If the command executes successfully, the setup is complete.

## ❌ **Uninstall**

If you want to remove the global link, run:

```sh
npm unlink -g acm-cli
```

## 👨‍💻 **Developers**

- Sebastian Galindo. [@TalkySafe143](https://github.com/TalkySafe143)
- Adrian Ruiz. [@adrianrrruiz](https://github.com/adrianrrruiz)
- Salomon Avila [@SalomonAvila](https://github.com/SalomonAvila)
