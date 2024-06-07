SAML_SETTINGS = {
    'strict': True,
    'debug': False,
    'sp': {
        'entityId': 'https://bb3e-85-253-68-86.ngrok-free.app',
        'assertionConsumerService': {
            'url': 'https://bb3e-85-253-68-86.ngrok-free.app/saml/callback',
            'binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
        },
        'assertionConsumerService': {
            'url': 'https://bb3e-85-253-68-86.ngrok-free.app/saml/login',
            'binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
        },
        'singleLogoutService': {
            'url': 'https://bb3e-85-253-68-86.ngrok-free.app/saml/logout',
            'binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
        },
        'NameIDFormat': 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
        'x509cert': '',
        'privateKey': '',
    },
    'idp': {
        'entityId': 'https://eipdev.ewi.tudelft.nl/saml/saml2/idp/metadata.php',
        'singleSignOnService': {
            'url': 'https://eipdev.ewi.tudelft.nl/saml/saml2/idp/SSOService.php',
            'binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
        },
        'singleLogoutService': {
            'url': 'https://eipdev.ewi.tudelft.nl/saml/saml2/idp/SingleLogoutService.php',
            'binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
        },
        'x509cert': '',
    },
}

# https://varun-sharma.medium.com/mastering-the-implementation-of-saml-2-0-authentication-in-django-91d381fd55e7