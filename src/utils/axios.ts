import axios from "axios";

const api = axios.create({
  baseURL: "http://api.mods.fonm.cn",
  headers: {
    Authorization:
      "bearer 9d2fa5ed0855483ceef0fb2ab7743be7305ccf217e4745eacb721daf7b9fcf6fb40e4e547fe26cb6461e86ee7c085a6f42fad02f995e7832560dd654fcee4168d78de29d6698f085e52776a16938ad85a07240eae114fc926d55ed2cd278ed4987a348eb2de91dda9aec6f6c632a20804b23a8962256c04e51a00f95256b7400"
  }
});

export default api;
