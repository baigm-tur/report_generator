import ReportForm from '@/components/ReportForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border py-6 bg-gradient-to-r from-primary/95 to-accent/95 shadow-md">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-6 h-6 text-primary"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-black bg-white px-4 py-2 rounded-md">Weekly Report Generator</h1>
            </div>
          </div>
        </div>
      </header>
      
      <div className="bg-gradient-to-b from-secondary/70 to-background py-10">
        <div className="container">
          <div className="w-full bg-card rounded-xl shadow-lg overflow-hidden">
            <div className="bg-primary/10 px-8 py-6 border-b border-border">
              <h2 className="text-2xl font-bold text-primary">Generate Report</h2>
              <p className="text-muted-foreground mt-2">
                Complete the form below to generate comprehensive performance reports for trainers. 
              </p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg mb-6 border border-border/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <div>
                  <h3 className="font-medium text-foreground">How to use this tool</h3>
                  <p className="text-sm text-muted-foreground">Upload both the current week and previous week CSV files to automatically fill the form fields. Once both files are processed, you can select a trainer from the dropdown below.</p>
                </div>
              </div>
              
              <ReportForm />
            </div>
          </div>
        </div>
      </div>
      
      <footer className="border-t border-border py-6 bg-muted mt-12">
        <div className="container">
          <div className="flex justify-between items-center">
            <p className="text-sm text-black">
              &copy; {new Date().getFullYear()} Weekly Report Generator
            </p>
            <p className="text-sm text-black">
              A professional tool for performance analysis
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
