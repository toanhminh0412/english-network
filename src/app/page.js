import * as d3 from "d3";
import {select, selectAll} from "d3";
import {mean, median} from "d3-array";
import NetworkGraph from "@/components/NetworkGraph";

export default function Home() {
  return (
    <div>
      <NetworkGraph/>
    </div>
  )
}
