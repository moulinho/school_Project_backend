import { AES, enc } from "crypto-js";
let aencrypt = AES.encrypt;
let adecrypt = AES.decrypt;

const KEY = "sha256";

export const encrypt = (data) => {
  let hashed = aencrypt(data, KEY).toString();
  return hashed;
};

export const decrypt = (hashed) => {
  let bytes_data = adecrypt(hashed, KEY);
  let data = bytes_data.toString(enc.Utf8);
  return data;
};
