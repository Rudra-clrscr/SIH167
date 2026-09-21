const API_BASE = '/api';

export async function uploadImages(files) {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function checkCompatibility(imageIds) {
  const res = await fetch(`${API_BASE}/compatibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(imageIds),
  });
  if (!res.ok) throw new Error('Compatibility check failed');
  return res.json();
}

export async function analyzeQuery(imageIds, query) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_ids: imageIds, query }),
  });
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}

export async function fetchSampleDatasets() {
  const res = await fetch(`${API_BASE}/sample-datasets`);
  if (!res.ok) throw new Error('Failed to fetch sample datasets');
  return res.json();
}

export async function runBenchmark(datasetName) {
  const res = await fetch(`${API_BASE}/run-benchmark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_name: datasetName }),
  });
  if (!res.ok) throw new Error('Benchmark run failed');
  return res.json();
}
