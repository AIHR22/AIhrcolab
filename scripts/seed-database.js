const fetch = require('node-fetch')

async function seedDatabase() {
  try {
    console.log('Starting database seeding...')
    
    const response = await fetch('http://localhost:3000/api/setup/seed-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('Database seeded successfully:', data.message)
    } else {
      console.error('Failed to seed database:', data.error)
      if (data.details) {
        console.error('Error details:', data.details)
      }
    }
  } catch (error) {
    console.error('Error running database seeding:', error)
  }
}

seedDatabase()

