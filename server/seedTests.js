const mongoose = require('mongoose');
const TestCatalog = require('./models/TestCatalog');

async function seedTests() {
  try {
    await mongoose.connect('mongodb://localhost:27017/careos-hospital');
    console.log('Connected to MongoDB');

    // Check if tests already exist
    const existingCount = await TestCatalog.countDocuments({ isActive: true });
    console.log('Existing active tests:', existingCount);

    if (existingCount === 0) {
      // Create sample tests
      const sampleTests = [
        {
          testCode: 'CBC',
          testName: 'Complete Blood Count',
          category: 'Hematology',
          department: 'Laboratory',
          sampleType: 'Blood',
          price: 500,
          turnaroundHours: 2,
          preparationInstructions: 'No special preparation required',
          parameters: [
            { name: 'Hemoglobin', unit: 'g/dL', normalRange: { male: '13.5-17.5', female: '12.0-15.5' } },
            { name: 'WBC Count', unit: 'cells/μL', normalRange: '4,500-11,000' },
            { name: 'Platelets', unit: 'cells/μL', normalRange: '150,000-450,000' }
          ],
          isActive: true
        },
        {
          testCode: 'RBS',
          testName: 'Random Blood Sugar',
          category: 'Biochemistry',
          department: 'Laboratory',
          sampleType: 'Blood',
          price: 300,
          turnaroundHours: 1,
          preparationInstructions: 'No fasting required',
          parameters: [
            { name: 'Glucose', unit: 'mg/dL', normalRange: '70-140' }
          ],
          isActive: true
        },
        {
          testCode: 'U/A',
          testName: 'Urine Analysis',
          category: 'Urine',
          department: 'Laboratory',
          sampleType: 'Urine',
          price: 200,
          turnaroundHours: 1,
          preparationInstructions: 'Clean catch midstream sample',
          parameters: [
            { name: 'pH', unit: '', normalRange: '4.5-8.0' },
            { name: 'Specific Gravity', unit: '', normalRange: '1.003-1.035' }
          ],
          isActive: true
        }
      ];

      await TestCatalog.insertMany(sampleTests);
      console.log('Sample tests created successfully');
    } else {
      console.log('Tests already exist, skipping seed');
    }

    // Show all tests
    const allTests = await TestCatalog.find({ isActive: true });
    console.log('All active tests:');
    allTests.forEach(test => {
      console.log(`- ${test.testCode}: ${test.testName} (${test.category}) - ₨${test.price}`);
    });

  } catch (error) {
    console.error('Error seeding tests:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedTests();
