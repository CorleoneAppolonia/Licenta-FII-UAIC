import { useState } from 'react';
import { decryptContent } from '../utils/encryption';

export function DecryptionTool() {
  const [ciphertext, setCiphertext] = useState('');
  const [plaintext, setPlaintext] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDecrypt = () => {
    setError(null);
    setPlaintext('');
    if (!ciphertext.trim()) {
      setError('Enter a weak XOR ciphertext to decode.');
      return;
    }

    try {
      const result = decryptContent(ciphertext.trim(), 'WEAK_XOR');
      setPlaintext(result);
    } catch (err) {
      console.error(err);
      setError('Could not decode ciphertext. Ensure it is base64 encoded weak XOR output.');
    }
  };

  const handleReset = () => {
    setCiphertext('');
    setPlaintext('');
    setError(null);
  };

  return (
    <section className="panel decryption-tool">
      <div className="panel-header">
        <h3>Weak XOR Decoder</h3>
        <div className="panel-actions">
          <button type="button" onClick={handleDecrypt}>Decode</button>
          <button type="button" onClick={handleReset}>Clear</button>
        </div>
      </div>
      <label className="decoder-input">
        Ciphertext
        <textarea
          value={ciphertext}
          onChange={(event) => setCiphertext(event.target.value)}
          placeholder="Paste base64 ciphertext here"
          rows={4}
        />
      </label>
      {error && <p className="error-text">{error}</p>}
      {plaintext && (
        <div className="decoder-output">
          <h4>Decoded Plaintext</h4>
          <pre>{plaintext}</pre>
        </div>
      )}
    </section>
  );
}
