const countryForm = document.getElementById("js-countryForm");
const countrySelect = countryForm.querySelector("select");

const handleCountryChange = e => {
  const {
    target: { value }
  } = e;
  if (value === "NONE") {
    return;
  } else {
    countryForm.submit();
  }
};

countrySelect.addEventListener("change", handleCountryChange);
