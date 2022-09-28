import { React, useState } from "react";
import { ApiKeyManager } from "@esri/arcgis-rest-request";
import Downshift from "downshift";
import { geocode } from "@esri/arcgis-rest-geocoding";
import { matchSorter } from "match-sorter";
import AddressForm from "./AddressForm";

import {
  Label,
  Menu,
  ControllerButton,
  Input,
  Item,
  ArrowIcon,
  XIcon,
  css,
} from "./styles";
import { Suggest } from "./Geocode";

const API_KEY =
  "YOUR_API_KEY";
const authentication = new ApiKeyManager({ key: API_KEY });

export default function Search() {
  const [theAddress, setTheAddress] = useState();
  const geocodeResult = ({ selectedItem }) => {
    if (selectedItem) {
      const { magicKey } = selectedItem;
      geocode({ magicKey, maxLocations: 1, authentication }).then((res) => {
        console.log(res.candidates[0]);
        alert(res.candidates[0].address);
        setTheAddress(res.candidates[0]);
      });
    }
  };
  const getItems = (allItems, filter) => {
    return filter
      ? matchSorter(allItems, filter, {
          keys: ["text"],
        })
      : allItems;
  };

  return (
    <Downshift
      itemToString={(item) => (item ? item.text : "")}
      onStateChange={geocodeResult}
    >
      {({
        selectedItem,
        getInputProps,
        getItemProps,
        highlightedIndex,
        isOpen,
        inputValue,
        getLabelProps,
        clearSelection,
        getToggleButtonProps,
        getMenuProps,
      }) => (
        <div {...css({ width: 550, margin: "auto" })}>
          <Label {...getLabelProps()}>Search Address</Label>
          <div {...css({ position: "relative" })}>
            <Input
              {...getInputProps({
                placeholder: "Search Address",
              })}
            />
            {selectedItem ? (
              <ControllerButton
                onClick={clearSelection}
                aria-label="clear selection"
              >
                <XIcon />
              </ControllerButton>
            ) : (
              <ControllerButton {...getToggleButtonProps()}>
                <ArrowIcon isOpen={isOpen} />
              </ControllerButton>
            )}
          </div>
          <div {...css({ position: "relative", zIndex: 1000 })}>
            <Menu {...getMenuProps({ isOpen })}>
              {(() => {
                if (!isOpen) {
                  return null;
                }

                if (!inputValue) {
                  return <Item disabled>You have to enter a search query</Item>;
                }

                return (
                  <Suggest address={`${inputValue}`}>
                    {({ loading, error, data = [] }) => {
                      if (loading) {
                        return <Item disabled>Loading...</Item>;
                      }

                      if (error) {
                        return <Item disabled>Error! {error}</Item>;
                      }

                      if (!data.length) {
                        return <Item disabled>No Addresses found</Item>;
                      }

                      return getItems(data, inputValue).map((item, index) => (
                        <Item
                          key={index}
                          {...getItemProps({
                            item,
                            index,
                            isActive: highlightedIndex === index,
                            isSelected: selectedItem === item,
                          })}
                        >
                          {item.text}
                        </Item>
                      ));
                    }}
                  </Suggest>
                );
              })()}
            </Menu>
            <AddressForm theAddress={theAddress} />
          </div>
        </div>
      )}
    </Downshift>
  );
}
