export function toDateString(date) {
  if (!(date instanceof Date)) date = new Date(date);
  const parts = date.toString().split(' ');
  return `${parts[1]} ${parts[2]}, ${parts[3]}`;
}

export function loadFile(fileName) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(new Uint8Array(reader.result));
    };
    reader.readAsArrayBuffer(fileName);
  });
}
//eslint-disable-next-line
String.prototype.hashCode = () => {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash &= hash; // Convert to 32bit integer
  }
  return hash;
};

export function pad(n, width, z) {
  z = z || '0';
  n += '';
  if (width >= n.length) return n;
  return n.length >= width ? n : new Array((width - n.length) + 1).join(z) + n;
}
