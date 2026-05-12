const TestCatalog = require('../models/TestCatalog');
const apiResponse = require('../utils/apiResponse');

exports.createTest = async (req, res, next) => {
  try {
    const {
      testCode,
      testName,
      category,
      department,
      sampleType,
      parameters,
      price,
      turnaroundHours,
      preparationInstructions
    } = req.body;

    // Check if test code already exists
    const existingTest = await TestCatalog.findOne({ testCode });
    if (existingTest) {
      return res.status(400).json(apiResponse({
        success: false,
        message: 'Test with this code already exists',
        data: null
      }));
    }

    const test = await TestCatalog.create({
      testCode,
      testName,
      category,
      department,
      sampleType,
      parameters: parameters || [],
      price,
      turnaroundHours,
      preparationInstructions: preparationInstructions || ''
    });

    res.status(201).json(apiResponse({
      success: true,
      message: 'Test created successfully',
      data: test
    }));
  } catch (error) {
    next(error);
  }
};

exports.getAllTests = async (req, res, next) => {
  try {
    const { category, department, page = 1, limit = 50 } = req.query;
    const filters = { isActive: true };
    
    if (category) filters.category = category;
    if (department) filters.department = department;
    
    const skip = (Number(page) - 1) * Number(limit);
    const total = await TestCatalog.countDocuments(filters);
    const tests = await TestCatalog.find(filters)
      .sort({ category: 1, testName: 1 })
      .skip(skip)
      .limit(Number(limit));

    // Group tests by category for better organization
    const groupedTests = tests.reduce((acc, test) => {
      if (!acc[test.category]) {
        acc[test.category] = [];
      }
      acc[test.category].push(test);
      return acc;
    }, {});

    res.status(200).json(apiResponse({
      success: true,
      message: 'Tests retrieved successfully',
      data: {
        tests: groupedTests,
        allTests: tests, // Keep flat array for table view
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit)
        }
      }
    }));
  } catch (error) {
    next(error);
  }
};

exports.getTestById = async (req, res, next) => {
  try {
    const test = await TestCatalog.findById(req.params.id);
    if (!test) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Test not found',
        data: null
      }));
    }

    res.status(200).json(apiResponse({
      success: true,
      message: 'Test retrieved successfully',
      data: test
    }));
  } catch (error) {
    next(error);
  }
};

exports.updateTest = async (req, res, next) => {
  try {
    const {
      testCode,
      testName,
      category,
      department,
      sampleType,
      parameters,
      price,
      turnaroundHours,
      preparationInstructions,
      isActive
    } = req.body;

    const test = await TestCatalog.findById(req.params.id);
    if (!test) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Test not found',
        data: null
      }));
    }

    // Check if test code is being changed and if it already exists
    if (testCode && testCode !== test.testCode) {
      const existingTest = await TestCatalog.findOne({ testCode });
      if (existingTest) {
        return res.status(400).json(apiResponse({
          success: false,
          message: 'Test with this code already exists',
          data: null
        }));
      }
    }

    const updateData = {};
    if (testCode !== undefined) updateData.testCode = testCode;
    if (testName !== undefined) updateData.testName = testName;
    if (category !== undefined) updateData.category = category;
    if (department !== undefined) updateData.department = department;
    if (sampleType !== undefined) updateData.sampleType = sampleType;
    if (parameters !== undefined) updateData.parameters = parameters;
    if (price !== undefined) updateData.price = price;
    if (turnaroundHours !== undefined) updateData.turnaroundHours = turnaroundHours;
    if (preparationInstructions !== undefined) updateData.preparationInstructions = preparationInstructions;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedTest = await TestCatalog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json(apiResponse({
      success: true,
      message: 'Test updated successfully',
      data: updatedTest
    }));
  } catch (error) {
    next(error);
  }
};

exports.deleteTest = async (req, res, next) => {
  try {
    const test = await TestCatalog.findById(req.params.id);
    if (!test) {
      return res.status(404).json(apiResponse({
        success: false,
        message: 'Test not found',
        data: null
      }));
    }

    // Soft delete by setting isActive to false
    await TestCatalog.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.status(200).json(apiResponse({
      success: true,
      message: 'Test deleted successfully',
      data: null
    }));
  } catch (error) {
    next(error);
  }
};

exports.searchTests = async (req, res, next) => {
  try {
    const { search, category, department, page = 1, limit = 50 } = req.query;
    const filters = { isActive: true };
    
    if (search) {
      filters.$or = [
        { testCode: { $regex: search, $options: 'i' } },
        { testName: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filters.category = category;
    if (department) filters.department = department;
    
    const skip = (Number(page) - 1) * Number(limit);
    const total = await TestCatalog.countDocuments(filters);
    const tests = await TestCatalog.find(filters)
      .sort({ category: 1, testName: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json(apiResponse({
      success: true,
      message: 'Tests found',
      data: {
        tests,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit)
        }
      }
    }));
  } catch (error) {
    next(error);
  }
};
