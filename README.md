# Employee Report Generator

A professional application for generating standardized reports based on employee performance data. This tool allows you to:

- Upload CSV data containing employee performance metrics
- Select specific employees from the uploaded data
- Automatically populate form fields from the CSV data
- Customize all aspects of the report
- Generate a formatted markdown report
- Copy the report to your clipboard with one click

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd report-generator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Uploading CSV Data

1. Click on the "Upload CSV" button to select your CSV file.
2. You can download a sample CSV file by clicking the "Download Sample CSV" button to test the application.
3. The application expects a CSV with specific columns for employee performance data.
4. After uploading, you can select an employee from the dropdown to populate the form.

### Using the Sample CSV File

1. Click the "Download Sample CSV" button to get a sample file with employee performance data.
2. Upload the sample file to see how data is automatically parsed.
3. Select any employee from the dropdown to see how fields are auto-populated.
4. The sample contains 10 different employee records with various metrics.

### Filling the Form

The form is divided into several sections:

- **Trainer Information**: Basic information about the trainer
- **Quality Metrics**: Data about task quality and scores
- **Throughput Metrics**: Information about productivity and task completion
- **Compliance Metrics**: Data about time tracking and adherence to policies
- **Conclusion**: Overall evaluation and ratings
- **Steps Taken**: Action items and recommendations

The form will be partially filled from CSV data, but you'll need to review and complete any missing fields.

### Generating the Report

1. Fill in all required fields (marked with *)
2. Click "Generate Report" to create the report
3. The generated report will appear below the form
4. Use the "Copy to Clipboard" button to copy the report for use elsewhere

## CSV Format

The application expects a CSV file with the following columns (among others):

- Week
- Contractor
- Campaign
- Lead
- (O)C
- T(O)C
- Z(O)C
- CC
- (R)C
- T(R)C
- Z(R)C
- TTC
- R
- ZR
- T(O)R
- T(R)R
- TTR
- Score Count
- QC%
- T(O)QC%
- T(T)QC%
- T(O)FR
- T(R)FR
- TTFR
- AvR
- ZAvR
- T(O)AvR
- T(R)AvR
- T(T)AvR
- Src Mon Tue Wed Thu Fri Sat Sun
- NoSD
- Mode
- LH
- T(C)LH
- T(NC)LH
- TLH
- H/T
- ZH/T
- T(O)H/T
- T(C)H/T
- T(T)H/T
- MH
- IH
- MH%
- IH%
- Ac
- ZAc
- Ac<5%
- Ac<10%
- Ac<20%
- Ac>90%
- Doff
- QCTC
- QCH/T
- ZQCTC
- Context
- Flag

## Features

- **Auto-calculation of team averages**: The application automatically calculates team averages based on all employees in the CSV file.
- **Smart data extraction**: Daily tasks and hours are parsed from complex strings in the CSV.
- **AI-generated evaluations**: The application suggests quality and throughput remarks based on the employee's performance.
- **Responsive design**: The application works on desktop and mobile devices.
- **Data validation**: Form fields are validated to ensure all required information is provided.

## Technologies Used

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod (for form validation)
- CSV parsing libraries

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
