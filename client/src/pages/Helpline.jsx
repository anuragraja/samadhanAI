export default function Helpline() {
  return (
    <div className="glass-card text-center" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="emergency-card mb-4" style={{ borderRadius: '50%', width: '120px', height: '120px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-phone-volume text-danger" style={{ fontSize: '3rem' }}></i>
        </div>
        <h2 className="mb-2">24/7 Emergency Helpline</h2>
        <p className="text-muted mb-4">Dedicated support for rural and offline access.</p>
        
        <div className="grid-2 mb-4">
            <a href="tel:1900111222" className="btn btn-primary w-100" style={{ padding: '15px', textDecoration: 'none' }}><i className="fa-solid fa-phone"></i> Call 1900-111-222</a>
            <a href="sms:55555?body=HELP" className="btn btn-secondary w-100" style={{ padding: '15px', textDecoration: 'none' }}><i className="fa-solid fa-comment-sms"></i> SMS "HELP" to 55555</a>
        </div>

        <div className="glass p-3 text-left" style={{ borderRadius: '8px' }}>
            <h4><i className="fa-solid fa-tower-cell"></i> Offline / Rural Mode</h4>
            <p className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>No Internet? Dial *99# to register a grievance via USSD interface from any basic mobile phone.</p>
        </div>
    </div>
  );
}
