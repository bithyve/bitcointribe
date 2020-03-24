export const CREATE_USER_PARAMS = {
  phone: '7585776475',
  country_code: '44',
  verification_code: '9590', // a 4-digit verification code,
  email: 'alimeer@gmail.com',
  bitcoin_address: '1JVhSfciiJEMk3b7yTPaPZ7AkVjopPjmCn',
  token: 'IUP5TCLFEZX6ACVOH9KH1WQD54HCVYO7TOP5JTSOCIJEABSPZ98WNJJTXEIJIFVO',
  initial_address_type: 'simple',
  xpub_key:
    'xpub6CPaz6tavH68fxBJpdJykvXjsjtpJ4cKPW1BuxgnGHaL3SApxkYNppJnEHo3xbyzUy9ortD6jJYk9ejSb3s4nkCvgC8qpuivsfUqcxDF2oB',
  xpub_addr_type: 'auto', // (auto/p2sh-segwit/bech32)
  xpub_path: 'm/0/x', // select derivataion paths (m/x-simple, m/0/x-industry std.)
  category: 'hexa' // affliate parameter (trezor/blockforge)
}

export const SEND_EMAIL_PARAMS = {
  email: 'alimeer@gmail.com',
  language: 'en', // (nl-Dutch, en-English)
  bitcoin_address: '1JVhSfciiJEMk3b7yTPaPZ7AkVjopPjmCn'
}

export const SEND_SMS_PARAMS = {
  phone: 7585776475,
  country_code: 44
}

export const VERIFY_EMAIL_PARAMS = {
  token: 'IUP5TCLFEZX6ACVOH9KH1WQD54HCVYO7TOP5JTSOCIJEABSPZ98WNJJTXEIJIFVO'
}

export const VERIFY_XPUB_PARAMS = {
  xpub_key:
    'xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz',
  xpub_path: 'm/0/x',
  xpub_addr_type: 'auto' // (auto/p2sh-segwit/bech32)
}
