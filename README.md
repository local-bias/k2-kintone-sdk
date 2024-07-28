# k2 - 🍳 kintone kitchen 🍳

kintone SDK for Node.js

## 🥦 Installation

```bash
npm install @konomi-app/k2
```

## 🥚 Requirements

### mkcert

K2 uses `mkcert` to generate a self-signed certificate for local development. You can install it by following the instructions [here](https://github.com/FiloSottile/mkcert).

```bash
# Windows
choco install mkcert

# macOS
brew install mkcert
```

If you are using Windows, you may need to install `Chocolatey` first. You can find the instructions [here](https://chocolatey.org/install).

## 🥕 Usage (kintone Customization)

### 1. Initialize

```bash
npx k2 init
```

This command will create a `.k2` directory in your project root. This directory contains the configuration files for K2.

### 2. Local Development

```bash
npx k2 dev
```

By executing the above command, a local server will be launched on the port number specified in the configuration file. By setting the URL of the local server to the app implementing kintone customization, you can develop in a local environment.

### 3. Build

```bash
npx k2 build
```

## 🥬 Usage (kintone Plugin)

### 1. Initialize

```bash
npx plugin init
```

This command will create a `.plugin` directory in your project root. This directory contains the configuration files for the plugin.

### 2. Local Development

```bash
npx plugin dev
```

By executing the above command, a local server will be launched on the port number specified in the configuration file. By setting the URL of the local server to the app implementing kintone plugin, you can develop in a local environment.
