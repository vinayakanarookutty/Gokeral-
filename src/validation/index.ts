import { z } from "zod"

export const sessionSchema = z.object({
    email: z.string(),
    name: z.string(),
})

// Kerala Driving License Validation Functions

/**
 * Validates Kerala driving license number format
 * Format: KL-07-2023-1234567 (State-Year-Year-7 digits)
 * or: KL-07-2023-123456 (State-Year-Year-6 digits)
 */
export const validateKeralaLicenseFormat = (licenseNumber: string): boolean => {
    // Remove spaces and convert to uppercase
    const cleanLicense = licenseNumber.replace(/\s/g, '').toUpperCase();
    
    // Pattern for Kerala license: KL-YY-YYYY-NNNNNNN or KL-YY-YYYY-NNNNNN
    const keralaLicensePattern = /^KL-\d{2}-\d{4}-\d{6,7}$/;
    
    return keralaLicensePattern.test(cleanLicense);
};

/**
 * Validates the year part of the license number
 * Year should be between 1990 and current year + 1
 */
export const validateLicenseYear = (licenseNumber: string): boolean => {
    const cleanLicense = licenseNumber.replace(/\s/g, '').toUpperCase();
    const yearMatch = cleanLicense.match(/KL-\d{2}-(\d{4})-\d{6,7}/);
    
    if (!yearMatch) return false;
    
    const year = parseInt(yearMatch[1]);
    const currentYear = new Date().getFullYear();
    
    // Year should be between 1990 and current year + 1 (for new licenses)
    return year >= 1990 && year <= currentYear + 1;
};

/**
 * Validates the district code (first two digits after KL-)
 * Kerala has 14 districts with codes 01-14
 */
export const validateDistrictCode = (licenseNumber: string): boolean => {
    const cleanLicense = licenseNumber.replace(/\s/g, '').toUpperCase();
    const districtMatch = cleanLicense.match(/KL-(\d{2})-\d{4}-\d{6,7}/);
    
    if (!districtMatch) return false;
    
    const districtCode = parseInt(districtMatch[1]);
    
    // Kerala district codes range from 01 to 14
    return districtCode >= 1 && districtCode <= 14;
};

/**
 * Validates the sequential number part (last 6-7 digits)
 * Should be numeric and reasonable range
 */
export const validateSequentialNumber = (licenseNumber: string): boolean => {
    const cleanLicense = licenseNumber.replace(/\s/g, '').toUpperCase();
    const sequentialMatch = cleanLicense.match(/KL-\d{2}-\d{4}-(\d{6,7})/);
    
    if (!sequentialMatch) return false;
    
    const sequentialNumber = parseInt(sequentialMatch[1]);
    
    // Sequential number should be reasonable (not 0 or extremely high)
    return sequentialNumber > 0 && sequentialNumber <= 9999999;
};

/**
 * Comprehensive Kerala driving license validation
 * Checks format, year, district code, and sequential number
 */
export const validateKeralaDrivingLicense = (licenseNumber: string): {
    isValid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];
    
    if (!licenseNumber || licenseNumber.trim() === '') {
        return {
            isValid: false,
            errors: ['Driving license number is required']
        };
    }
    
    // Check format
    if (!validateKeralaLicenseFormat(licenseNumber)) {
        errors.push('Invalid license format. Expected format: KL-YY-YYYY-NNNNNNN (e.g., KL-07-2023-1234567)');
    }
    
    // Check year if format is valid
    if (validateKeralaLicenseFormat(licenseNumber) && !validateLicenseYear(licenseNumber)) {
        errors.push('Invalid year in license number. Year should be between 1990 and current year');
    }
    
    // Check district code if format is valid
    if (validateKeralaLicenseFormat(licenseNumber) && !validateDistrictCode(licenseNumber)) {
        errors.push('Invalid district code. Kerala district codes range from 01 to 14');
    }
    
    // Check sequential number if format is valid
    if (validateKeralaLicenseFormat(licenseNumber) && !validateSequentialNumber(licenseNumber)) {
        errors.push('Invalid sequential number in license');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Formats license number for display (adds spaces for readability)
 */
export const formatKeralaLicense = (licenseNumber: string): string => {
    const cleanLicense = licenseNumber.replace(/\s/g, '').toUpperCase();
    
    if (!validateKeralaLicenseFormat(cleanLicense)) {
        return licenseNumber; // Return original if invalid
    }
    
    // Format as KL-YY-YYYY-NNNNNNN
    return cleanLicense.replace(/^(.{2})-(\d{2})-(\d{4})-(\d{6,7})$/, '$1-$2-$3-$4');
};

/**
 * Zod schema for Kerala driving license validation
 */
export const keralaLicenseSchema = z.string()
    .min(1, 'Driving license number is required')
    .refine((value) => {
        const validation = validateKeralaDrivingLicense(value);
        return validation.isValid;
    }, (value) => {
        const validation = validateKeralaDrivingLicense(value);
        return {
            message: validation.errors[0] || 'Invalid driving license number'
        };
    });

/**
 * Ant Design form validator for Kerala driving license
 */
export const keralaLicenseValidator = (_: any, value: string) => {
    if (!value || value.trim() === '') {
        return Promise.reject(new Error('Please input your driving license number!'));
    }
    
    const validation = validateKeralaDrivingLicense(value);
    
    if (!validation.isValid) {
        return Promise.reject(new Error(validation.errors[0]));
    }
    
    return Promise.resolve();
};
