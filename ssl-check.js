const tls = require('tls');

function getSSLCertExpiry(hostname, port = 443) {
  const options = {
    host: hostname,
    port: port,
    servername: hostname,
    rejectUnauthorized: false,
  };

  const socket = tls.connect(options, () => {
    const cert = socket.getPeerCertificate();
    if (cert && cert.valid_to) {
      console.log(`\n🔗 ${hostname}`);
      console.log(`✅ Expires on: ${cert.valid_to}`);

      const expiryDate = new Date(cert.valid_to);
      const daysLeft = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`⏳ Days left: ${daysLeft}`);

      if (daysLeft < 14) {
        console.warn(`⚠️ Warning: SSL certificate expires soon!`);
      }
    } else {
      console.log(`❌ Could not retrieve certificate for ${hostname}`);
    }
    socket.end();
  });

  socket.on('error', (err) => {
    console.error(`❌ Error for ${hostname}: ${err.message}`);
  });
}

// 🔁 List of domains to check
const websites = [
  'www.cuedwell.com',
  'demo.cuedwell.com',
  'www.cuedlink.com',
  'demo.cuedlink.com',
  'www.cuetree.com' ,
  'global.iitm.ac.in',
  'tac.global.iitm.ac.in',// 👈 Sample expired cert for testing

];

// Run check for each domain
websites.forEach(domain => getSSLCertExpiry(domain));
