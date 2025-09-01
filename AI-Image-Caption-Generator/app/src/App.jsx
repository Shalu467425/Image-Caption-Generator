import React, { useState } from 'react'

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('—');
  const [status, setStatus] = useState('');
  const [history, setHistory] = useState([]);
  const [url, setUrl] = useState('');

  const apiUrl = '/api/caption';

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const sendBase64 = async (base64) => {
    setStatus('Sending to server...');
    setCaption('—');
    try {
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Server error');
      const text = data.caption || 'No caption returned.';
      const conf = data.confidence ? ` (confidence: ${data.confidence})` : '';
      setCaption(text + conf);
      setHistory(prev => [{thumb: preview, caption: text, confidence: data.confidence || null}, ...prev].slice(0,10));
      setStatus('');
    } catch (err) {
      setStatus(err.message || 'Request failed.');
    }
  };

  const handleUpload = () => {
    if (!file) { setStatus('Select an image first'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      sendBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUrl = async () => {
    if (!url) { setStatus('Enter URL'); return; }
    setStatus('Requesting...');
    setCaption('—');
    try {
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Server error');
      const text = data.caption || 'No caption returned.';
      setCaption(text);
      setHistory(prev => [{thumb: url, caption: text, confidence: data.confidence || null}, ...prev].slice(0,10));
      setStatus('');
    } catch (err) {
      setStatus(err.message || 'Request failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Azure Caption Generator</h1>
        <p className="text-sm text-slate-500">Upload an image or use a public image URL.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow">
        <div>
          <label className="block text-sm font-medium mb-2">Upload</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {preview && <img src={preview} alt="preview" className="mt-4 rounded-lg max-h-48 object-contain"/>}
          <button onClick={handleUpload} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white">Generate Caption</button>
          <p className="text-sm text-slate-500 mt-2">{status}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full border rounded-xl px-3 py-2" />
          <button onClick={handleUrl} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white">Generate Caption</button>
          <p className="text-sm text-slate-500 mt-2">{status}</p>
        </div>
      </div>

      <section className="mt-6 bg-white p-6 rounded-2xl shadow">
        <h2 className="text-sm font-medium text-slate-600">Caption</h2>
        <div className="mt-2 text-lg text-slate-800">{caption}</div>
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-medium mb-2">History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((h, i) => (
            <div key={i} className="bg-white p-3 rounded-xl shadow flex gap-3 items-center">
              <img src={h.thumb} alt="" className="w-20 h-20 object-cover rounded-md"/>
              <div>
                <div className="text-sm font-medium">{h.caption}</div>
                {h.confidence !== null && <div className="text-xs text-slate-500">confidence: {h.confidence}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;