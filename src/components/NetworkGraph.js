"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as d3 from 'd3';

export default function NetworkGraph({width=1000, height=500}) {
    const [people, setPeople] = useState([]);

    const drawGraph = async () => {
        // Extract the data
        const data = await d3.json('data/data.json');
        
        const links = data.relationships.map(d => ({...d}));
        let nodes = data.people.map(d => ({...d}));
        setPeople(nodes);

        // Initialize color
        const color = d3.scaleOrdinal(d3.schemeTableau10);

        // Create a simulation with several forces.
        const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(200))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width/2, height/2))
        .on("tick", ticked);

        const svg = d3.select("svg");

        // Draw the lines
        const link = svg.append("g")
        .selectAll()
            .data(links)
            .join("line")
            .attr("stroke-width", 3)
            .attr("stroke", "#999");

        // Draw the nodes
        const node = svg.append("g")
            .attr("stroke-width", 3)
        .selectAll()
            .data(nodes)
            .join("circle")
            .attr("aria-labelledby", d => d.name)
            .attr("r", 20)
            .attr("fill", d => color(d.id+1))
            .attr("stroke", "#999");


        node.append("title")
        .text(d => d.name);

        // Add a drag behavior.
        node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

        node
        // Show black border when hovering on node
        .on("mouseover", (event) => {
            event.target.style.stroke = '#000';
        })
        // Show grey border when hovering on node
        .on("mouseout", (event) => {
            event.target.style.stroke = '#999';
        })
        // Show a person bio when clicking on node
        .on("click", (event, d) => {
            document.getElementById(`bio-${d.id}`).showModal();
        })

        // Add a hover effect for lines
        link
        .on("mouseover", (event) => {
            event.target.style.stroke = '#000';
        })
        .on("mouseout", (event) => {
            event.target.style.stroke = '#999';
        })


        // Update position of lines and nodes every second
        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }
        
        // Functions to handle drag events
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
    }

    useEffect(() => {
        drawGraph();
    }, [])

    return (
    <>
        <svg viewBox={`0 0 ${width} ${height}`}></svg>
        {/* <dialog id="bio-0" className="modal">
            <form method="dialog" className="modal-box">
                <h3 className="font-bold text-lg">Hello!</h3>
                <p className="py-4">Press ESC key or click the button below to close</p>
                <div className="modal-action">
                    <button className="btn">Close</button>
                </div>
            </form>
        </dialog> */}
        {people.map(person => (
        <dialog key={person.id} id={`bio-${person.id}`} className="modal">
            <form method="dialog" className="modal-box">
                <h3 className="font-bold text-xl">{person.bio.fullbio ? (<Link href={person.bio.fullbio} target="_blank" className="underline underline-offset-4">{person.name}</Link>) : person.name}</h3>
                <ul className="mt-3">
                    {Object.keys(person.bio).map((key) => (
                    <li key={key}><strong className="mr-2">{key[0].toUpperCase() + key.slice(1) + ":"}</strong>{key === "fullbio" ? <Link href={person.bio[key]} target="_blank" className="underline underline-offset-4">{person.bio[key]}</Link> : person.bio[key]}</li>
                    ))}
                </ul>
                <div className="modal-action">
                    <button className="btn">Close</button>
                </div>
            </form>
        </dialog>
        ))}
    </>
    )
}