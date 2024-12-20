let data = await fetch("./src/data/json/base_officielle_codes_postaux.json");
data = await data.json();

let Codes = {}

Codes.getAll = function() {
    return data.filter(item => item.code_postal.endsWith("000"));
}
export { Codes };