import React from "react";

const AddressForm = ({ theAddress }) => {
  return <div>{JSON.stringify(theAddress, null, 1)}</div>;
};

export default AddressForm;
