#!/bin/bash

# Test script to verify all examples are ready to run
# =====================================================

echo "=========================================="
echo "CreoleCentric API Examples - Verification"
echo "=========================================="
echo ""

ERRORS=0

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo "✓ $2"
    else
        echo "✗ $2"
        ERRORS=$((ERRORS + 1))
    fi
}

echo "1. Checking Shell Scripts"
echo "--------------------------"

# Check bash is available
if command_exists bash; then
    print_status 0 "bash is installed"
else
    print_status 1 "bash is not installed"
fi

# Check curl is available
if command_exists curl; then
    print_status 0 "curl is installed"
else
    print_status 1 "curl is not installed (required for shell examples)"
fi

# Check if jq is available (optional but recommended)
if command_exists jq; then
    print_status 0 "jq is installed (JSON parsing will work)"
else
    echo "⚠ jq is not installed (optional, but JSON parsing will be limited)"
fi

# Check shell script syntax
for script in examples/*.sh; do
    if [ -f "$script" ]; then
        bash -n "$script" 2>/dev/null
        print_status $? "$(basename $script) - syntax check"

        # Check if executable
        if [ -x "$script" ]; then
            print_status 0 "$(basename $script) - is executable"
        else
            print_status 1 "$(basename $script) - is not executable (run: chmod +x $script)"
        fi
    fi
done

echo ""
echo "2. Checking Python Environment"
echo "-------------------------------"

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    print_status 0 "Python3 is installed ($PYTHON_VERSION)"

    # Check Python syntax
    python3 -m py_compile python/creolecentric_api.py 2>/dev/null
    print_status $? "creolecentric_api.py - syntax check"

    python3 -m py_compile examples/webhook_server.py 2>/dev/null
    print_status $? "webhook_server.py - syntax check"

    # Check if required modules can be imported
    echo "  Checking Python dependencies:"
    python3 -c "import requests" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "    ✓ requests is installed"
    else
        echo "    ✗ requests is not installed (run: pip install requests)"
        echo "      To install all dependencies: pip install -r python/requirements.txt"
        ERRORS=$((ERRORS + 1))
    fi

    python3 -c "import dotenv" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "    ✓ python-dotenv is installed"
    else
        echo "    ⚠ python-dotenv is not installed (optional, run: pip install python-dotenv)"
    fi

    python3 -c "import flask" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "    ✓ flask is installed (webhook server will work)"
    else
        echo "    ⚠ flask is not installed (optional for webhook server, run: pip install flask)"
    fi
else
    print_status 1 "Python3 is not installed"
fi

echo ""
echo "3. Checking Node.js Environment"
echo "--------------------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js is installed ($NODE_VERSION)"

    # Check Node.js syntax
    node -c nodejs/creolecentric-api.js 2>/dev/null
    print_status $? "creolecentric-api.js - syntax check"

    node -c examples/webhook_server.js 2>/dev/null
    print_status $? "webhook_server.js - syntax check"

    # Check if package.json exists
    if [ -f "nodejs/package.json" ]; then
        print_status 0 "package.json exists"

        # Check if node_modules exists
        if [ -d "nodejs/node_modules" ]; then
            echo "  ✓ Dependencies appear to be installed"
        else
            echo "  ⚠ Dependencies not installed (run: cd nodejs && npm install)"
        fi
    else
        print_status 1 "package.json is missing"
    fi
else
    print_status 1 "Node.js is not installed"
fi

echo ""
echo "4. Checking API Configuration"
echo "------------------------------"

# Check if API key environment variable is set
if [ -n "$CREOLECENTRIC_API_KEY" ] && [ "$CREOLECENTRIC_API_KEY" != "cc_your_api_key_here" ]; then
    print_status 0 "CREOLECENTRIC_API_KEY is set"
else
    echo "⚠ CREOLECENTRIC_API_KEY is not set or using placeholder"
    echo "  Set it with: export CREOLECENTRIC_API_KEY='cc_your_actual_key'"
fi

# Check .env file
if [ -f ".env" ]; then
    echo "✓ .env file exists (for local development)"
elif [ -f "python/.env" ]; then
    echo "✓ python/.env file exists"
elif [ -f "nodejs/.env" ]; then
    echo "✓ nodejs/.env file exists"
else
    echo "⚠ No .env file found (optional, can use environment variables instead)"
fi

echo ""
echo "5. Quick Start Commands"
echo "-----------------------"
echo ""
echo "To run the examples:"
echo ""
echo "Shell (Polling):"
echo "  export CREOLECENTRIC_API_KEY='cc_your_key'"
echo "  ./examples/tts_job_with_polling.sh"
echo ""
echo "Shell (Webhook):"
echo "  export CREOLECENTRIC_API_KEY='cc_your_key'"
echo "  export WEBHOOK_URL='https://your-webhook-url.com/webhook'"
echo "  ./examples/tts_job_with_webhook.sh"
echo ""
echo "Python:"
echo "  cd python"
echo "  pip install -r requirements.txt"
echo "  export CREOLECENTRIC_API_KEY='cc_your_key'"
echo "  python3 creolecentric_api.py"
echo ""
echo "Node.js:"
echo "  cd nodejs"
echo "  npm install"
echo "  export CREOLECENTRIC_API_KEY='cc_your_key'"
echo "  node creolecentric-api.js"
echo ""
echo "Webhook Servers:"
echo "  Python: python3 examples/webhook_server.py"
echo "  Node.js: node examples/webhook_server.js"
echo ""

echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo "✓ All checks passed! Examples are ready to run."
else
    echo "✗ Found $ERRORS issue(s). Please fix them before running examples."
fi
echo "=========================================="

exit $ERRORS