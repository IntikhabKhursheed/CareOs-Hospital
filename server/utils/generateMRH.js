const padNumber = (value, length = 5) => String(value).padStart(length, '0');

const generateMRH = () => {
  const year = new Date().getFullYear();
  const randomValue = Math.floor(Math.random() * 99999) + 1;
  return `MRH-${year}-${padNumber(randomValue)}`;
};

module.exports = generateMRH;
