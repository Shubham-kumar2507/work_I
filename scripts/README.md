# Build & Deployment Scripts

Automation scripts for building, testing, and deploying the IoT monitoring system.

## Available Scripts

### Build Scripts

**`build-all.sh`** - Build all components
```bash
./scripts/build-all.sh
```

**`build-cpp-agent.sh`** - Build C++ agent only
```bash
./scripts/build-cpp-agent.sh
```

**`build-dashboard.sh`** - Build MERN dashboard
```bash
./scripts/build-dashboard.sh
```

### Test Scripts

**`test-all.sh`** - Run all tests
```bash
./scripts/test-all.sh
```

**`test-unit.sh`** - Run unit tests only
```bash
./scripts/test-unit.sh
```

**`test-integration.sh`** - Run integration tests
```bash
./scripts/test-integration.sh
```

### Deployment Scripts

**`deploy-local.sh`** - Deploy to local Docker environment
```bash
./scripts/deploy-local.sh
```

**`deploy-dev.sh`** - Deploy to development environment
```bash
./scripts/deploy-dev.sh
```

**`deploy-prod.sh`** - Deploy to production
```bash
./scripts/deploy-prod.sh
```

### Utility Scripts

**`setup-dev-env.sh`** - Set up development environment
```bash
./scripts/setup-dev-env.sh
```

**`clean.sh`** - Clean build artifacts
```bash
./scripts/clean.sh
```

**`lint.sh`** - Run code linting
```bash
./scripts/lint.sh
```

## Usage

All scripts should be run from the project root directory:

```bash
# Make scripts executable (first time only)
chmod +x scripts/*.sh

# Run a script
./scripts/build-all.sh
```

## Directory Structure

```
scripts/
├── build/
│   ├── build-all.sh
│   ├── build-cpp-agent.sh
│   └── build-dashboard.sh
├── test/
│   ├── test-all.sh
│   ├── test-unit.sh
│   └── test-integration.sh
├── deploy/
│   ├── deploy-local.sh
│   ├── deploy-dev.sh
│   └── deploy-prod.sh
└── utils/
    ├── setup-dev-env.sh
    ├── clean.sh
    └── lint.sh
```

## Next Steps

1. Create build automation scripts
2. Write test runner scripts
3. Implement deployment automation
4. Add pre-commit hooks
5. Create CI/CD integration scripts
