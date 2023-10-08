
export const GeoSeverUtil = {
  init: {
    url: function(name) {
      const typeName = `Lianjie_Map:province`

      let res = ''
      res = 
`http://jj.gdhwater.com:9983/geoserver/Lianjie_Map/ows?
service=WFS&
version=1.0.0&
request=GetFeature&
typeName=${typeName}&
maxFeatures=${50}&
outputFormat=application/json&
cql_filter=name='${name}'`;

      res = res.replace(/\n/g, '')
      return res;
    },
  },
}

export function setMultiPolygon(list4) {
  let json = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "MultiPolygon",
      "coordinates": null,
    }
  };
  json.geometry.coordinates = list4;
  return json;
}

export function getCenterByExtentList(list) {
  let p1 = list.slice(0, 2)
  let p2 = list.slice(2)
  let p = [
    getCenter(p1[0], p2[0]),
    getCenter(p1[1], p2[1]),
  ]

  return p;

  function getCenter(a, b) {
    let min = Math.min(a, b)
    let diff = Math.abs(a - b)
    return min + diff / 2;
  }
}