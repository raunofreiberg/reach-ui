import React from "react";
import { RadioGroup, Radio } from "../src";
import "../styles.css";

let name = "Basic";

function Example() {
  return (
    <>
      <h2 id="pizza-crust">Pizza crust</h2>
      <p id="pizza-crust-desc">Select your favorite pizza</p>
      <RadioGroup
        aria-labelledby="pizza-crust"
        aria-describedby="pizza-crust-desc"
      >
        <Radio>Regular crust</Radio>
        <Radio>Deep dish</Radio>
        <Radio>Thin crust</Radio>
      </RadioGroup>
      <h2 id="pizza-delivery">Pizza delivery</h2>
      <p id="pizza-delivery-desc">Select your preferred method of delivery</p>
      <RadioGroup
        aria-labelledby="pizza-delivery"
        aria-describedby="pizza-delivery-desc"
      >
        <Radio>Pickup</Radio>
        <Radio>Home delivery</Radio>
        <Radio>Dine in</Radio>
      </RadioGroup>
    </>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "RadioGroup" };
