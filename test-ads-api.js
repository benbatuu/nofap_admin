const BASE_URL = 'http://localhost:3000/api'

async function testAdsAPI() {
    console.log('🧪 Testing Ads API...\n')

    try {
        // Test 1: Get all ads
        console.log('1. Testing GET /api/ads')
        const adsResponse = await fetch(`${BASE_URL}/ads`)
        const adsData = await adsResponse.json()
        console.log('✅ GET /api/ads:', adsData.success ? 'SUCCESS' : 'FAILED')
        console.log('   Ads count:', adsData.data?.ads?.length || 0)
        console.log()

        // Test 2: Create a new ad
        console.log('2. Testing POST /api/ads')
        const newAd = {
            title: 'Test Banner Ad',
            description: 'This is a test banner advertisement',
            targetUrl: 'https://example.com',
            type: 'banner',
            placement: 'header',
            budget: 100,
            startDate: new Date().toISOString()
        }

        const createResponse = await fetch(`${BASE_URL}/ads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAd)
        })
        const createData = await createResponse.json()
        console.log('✅ POST /api/ads:', createData.success ? 'SUCCESS' : 'FAILED')

        if (createData.success) {
            const createdAdId = createData.data.id
            console.log('   Created ad ID:', createdAdId)

            // Test 3: Get analytics
            console.log('\n3. Testing GET /api/ads/analytics')
            const analyticsResponse = await fetch(`${BASE_URL}/ads/analytics`)
            const analyticsData = await analyticsResponse.json()
            console.log('✅ GET /api/ads/analytics:', analyticsData.success ? 'SUCCESS' : 'FAILED')
            console.log('   Total ads:', analyticsData.data?.overview?.totalAds || 0)
            console.log('   Active ads:', analyticsData.data?.overview?.activeAds || 0)
            console.log()

            // Test 4: Get suggestions
            console.log('4. Testing GET /api/ads/suggestions')
            const suggestionsResponse = await fetch(`${BASE_URL}/ads/suggestions`)
            const suggestionsData = await suggestionsResponse.json()
            console.log('✅ GET /api/ads/suggestions:', suggestionsData.success ? 'SUCCESS' : 'FAILED')
            console.log('   Suggestions count:', suggestionsData.data?.suggestions?.length || 0)
            console.log()

            // Test 5: Update the ad
            console.log('5. Testing PUT /api/ads/:id')
            const updateResponse = await fetch(`${BASE_URL}/ads/${createdAdId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Updated Test Banner Ad',
                    status: 'paused'
                })
            })
            const updateData = await updateResponse.json()
            console.log('✅ PUT /api/ads/:id:', updateData.success ? 'SUCCESS' : 'FAILED')
            console.log()

            // Test 6: Get single ad
            console.log('6. Testing GET /api/ads/:id')
            const singleAdResponse = await fetch(`${BASE_URL}/ads/${createdAdId}`)
            const singleAdData = await singleAdResponse.json()
            console.log('✅ GET /api/ads/:id:', singleAdData.success ? 'SUCCESS' : 'FAILED')
            console.log('   Ad title:', singleAdData.data?.title)
            console.log('   Ad status:', singleAdData.data?.status)
            console.log()

            // Test 7: Delete the ad
            console.log('7. Testing DELETE /api/ads/:id')
            const deleteResponse = await fetch(`${BASE_URL}/ads/${createdAdId}`, {
                method: 'DELETE'
            })
            const deleteData = await deleteResponse.json()
            console.log('✅ DELETE /api/ads/:id:', deleteData.success ? 'SUCCESS' : 'FAILED')
            console.log()
        }

        console.log('🎉 All ads API tests completed!')

    } catch (error) {
        console.error('❌ Test failed:', error.message)
    }
}

// Run the test
testAdsAPI()