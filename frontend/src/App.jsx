import React, { useState } from 'react';
import Layout from './components/Layout';
import Upload from './components/Upload';
import Dashboard from './pages/Dashboard';
import { generatePDF } from './utils/reportGenerator';

function App() {
  const [analysisData, setAnalysisData] = useState(null);

  return (
    <Layout
      hasData={!!analysisData}
      onReset={() => setAnalysisData(null)}
      onExport={() => analysisData && generatePDF(analysisData)}
    >
      <div className="container">
        {!analysisData ? (
          <Upload onAnalysisComplete={setAnalysisData} />
        ) : (
          <Dashboard
            data={analysisData}
            onReset={() => setAnalysisData(null)}
          />
        )}
      </div>
    </Layout>
  );
}

export default App;
