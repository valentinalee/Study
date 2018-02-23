const axios = require('axios');
const iconv = require('iconv-lite');

axios.interceptors.response.use(function (response) {
  let ctype = response.headers["content-type"];
  response.data = ctype.includes("charset=GB2312") ?
    iconv.decode(response.data, 'gb2312') :
    iconv.decode(response.data, 'utf-8');
  // response.data = iconv.decode(response.data, 'GBK');
  return response;
})

// http://www.nifdc.org.cn/CL0108/
// http://www.nifdc.org.cn/CL0903/10511.html

axios
    .get('http://www.nifdc.org.cn/CL0903/10511.html',{ responseType: 'arraybuffer' })
    .then((res) => {
        if (res.status === 200) {
            console.log(res.data);
            // console.log(iconv.decode(res.data, 'gb2312'));
        } else {
            console.log(res.status);
        }
    })
    .catch(error => {
        console.log(error);
    })