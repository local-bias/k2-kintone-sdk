import forge from 'node-forge';
import net from 'node:net';

const { md, pki } = forge;

function createCertificate(
  serial: string,
  publicKey: forge.pki.rsa.PublicKey,
  subject: forge.pki.CertificateField[],
  issuer: forge.pki.CertificateField[],
  extensions: any[],
  validity: number,
  signWith: forge.pki.rsa.PrivateKey
): forge.pki.Certificate {
  const cert = pki.createCertificate();
  cert.serialNumber = Buffer.from(serial).toString('hex');
  cert.publicKey = publicKey;
  cert.setSubject(subject);
  cert.setIssuer(issuer);
  cert.setExtensions(extensions);
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setDate(cert.validity.notAfter.getDate() + validity);
  cert.sign(signWith, md.sha256.create());
  return cert;
}

function generateCertInternal(params: {
  subject: forge.pki.CertificateField[];
  issuer: forge.pki.CertificateField[];
  extensions: any[];
  validity: number;
  signWith?: string;
}): { key: string; cert: string } {
  const { subject, issuer, extensions, validity, signWith } = params;
  const serial = Math.floor(Math.random() * 95000 + 50000).toString();
  const keyPair = pki.rsa.generateKeyPair(2048);
  const privateKey = signWith ? pki.privateKeyFromPem(signWith) : keyPair.privateKey;

  const cert = createCertificate(
    serial,
    keyPair.publicKey,
    subject,
    issuer,
    extensions,
    validity,
    privateKey
  );

  return {
    key: pki.privateKeyToPem(keyPair.privateKey),
    cert: pki.certificateToPem(cert),
  };
}

/**
 * ルートCA証明書を生成します
 */
export function createCA(
  params: {
    organization?: string;
    countryCode?: string;
    state?: string;
    locality?: string;
    validity?: number;
  } = {}
): { key: string; cert: string } {
  const {
    organization = 'K2 Development CA',
    countryCode = 'JP',
    state = 'Tokyo',
    locality = 'Tokyo',
    validity = 7300,
  } = params;

  const attributes: forge.pki.CertificateField[] = [
    { name: 'commonName', value: organization },
    { name: 'countryName', value: countryCode },
    { name: 'stateOrProvinceName', value: state },
    { name: 'localityName', value: locality },
    { name: 'organizationName', value: organization },
  ];

  const extensions = [
    { name: 'basicConstraints', cA: true, critical: true },
    { name: 'keyUsage', keyCertSign: true, critical: true },
  ];

  return generateCertInternal({
    subject: attributes,
    issuer: attributes,
    extensions,
    validity,
  });
}

/**
 * CA証明書で署名されたサーバー証明書を生成します
 */
export function createCert(params: {
  ca: { cert: string | Buffer; key: string | Buffer };
  domains: string[];
  validity?: number;
}): { key: string; cert: string } {
  const { ca, domains, validity = 7300 } = params;

  const attributes: forge.pki.CertificateField[] = [{ name: 'commonName', value: domains[0] }];

  const extensions = [
    { name: 'basicConstraints', cA: false, critical: true },
    {
      name: 'keyUsage',
      digitalSignature: true,
      keyEncipherment: true,
      critical: true,
    },
    { name: 'extKeyUsage', serverAuth: true, clientAuth: true },
    {
      name: 'subjectAltName',
      altNames: domains.map((domain) => {
        const TYPE_DOMAIN = 2;
        const TYPE_IP = 7;
        return net.isIP(domain)
          ? { type: TYPE_IP, ip: domain }
          : { type: TYPE_DOMAIN, value: domain };
      }),
    },
  ];

  const caCert = pki.certificateFromPem(ca.cert.toString());

  return generateCertInternal({
    subject: attributes,
    issuer: caCert.subject.attributes,
    extensions,
    validity,
    signWith: ca.key.toString(),
  });
}
