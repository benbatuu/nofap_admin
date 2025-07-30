const API_BASE = 'http://localhost:3000/api'

async function testAPI(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        }

        if (data) {
            options.body = JSON.stringify(data)
        }

        const response = await fetch(`${API_BASE}${endpoint}`, options)
        const result = await response.json()

        console.log(`${method} ${endpoint}:`, response.status, result.success ? '✅' : '❌')
        if (!result.success) {
            console.log('Error:', result.error)
        }
        return result
    } catch (error) {
        console.log(`${method} ${endpoint}:`, '❌', error.message)
        return null
    }
}

async function runTests() {
    console.log('🧪 Testing Billing API Endpoints...\n')

    // Test Products
    console.log('📦 Testing Products API:')
    await testAPI('/billing/products')
    await testAPI('/billing/products/analytics')
    await testAPI('/billing/products/suggestions')

    console.log('\n💳 Testing Subscriptions API:')
    await testAPI('/billing/subscriptions')
    await testAPI('/billing/subscriptions/analytics')

    console.log('\n✅ Tests completed!')
}

runTests().catch(console.error)