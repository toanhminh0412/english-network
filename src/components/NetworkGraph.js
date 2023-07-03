"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as d3 from 'd3';

export default function NetworkGraph({width=1000, height=500}) {
    const [people, setPeople] = useState([]);
    const [relationships, setRelationships] = useState([]);

    const drawGraph = async () => {
        // Extract the data
        const data = await d3.json('data/data.json');
        
        let nodes = data.people.map(d => ({...d}));
        const links = data.relationships.map(d => ({...d}));
        setPeople(nodes);
        setRelationships(links);

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

        // Add names as texts to nodes
        const text = svg.append("g")
        .selectAll()
            .data(nodes)
            .join("text")
            .text(d => d.name);

        // Add a title tag to each node
        node.append("title")
        .text(d => d.name);

        // Add a drag behavior.
        node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

        node
        .on("mouseover", (event) => {
            event.target.style.stroke = '#000';
        })
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
        // Show two people's relationship when clicking on a link between them
        .on("click", (event, d) => {
            document.getElementById(`relationship-${d.id}`).showModal();
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
            text
                .attr("x", d => d.x)
                .attr("y", d => d.y);
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
        <svg width="100%" height="100vh" viewBox={`0 0 ${width} ${height}`}></svg>
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
                    <button className="btn btn-neutral">Close</button>
                </div>
            </form>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
        ))}
        {relationships.map(relationship => (
        <dialog key={relationship.id} id={`relationship-${relationship.id}`} className="modal">
            <form method="dialog" className="modal-box max-h-[700px]">
                <h3 className="font-medium text-xl">Letters between <span className="font-bold">{relationship.source.name}</span> and <span className="font-bold">{relationship.target.name}</span></h3>
                {relationship.letters.map((letter, letterIndex) => (
                <div key={letter.title} className="collapse bg-base-200 mt-4">
                    <input type="radio" name="my-accordion-1" defaultChecked={letterIndex === 0}/> 
                    <div className="collapse-title text-sm font-light">
                        <span className="text-xl font-medium">{letter.title}</span><br/>
                        - From {people[letter.from].name} to {people[letter.to].name}
                    </div>
                    <div className="collapse-content"> 
                        <iframe src={letter.content} className="w-full min-h-[300px]"></iframe>
                    </div>
                </div>
                ))}
                <div className="modal-action">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn btn-neutral">Close</button>
                </div>
            </form>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
        ))}
    </>
    )
}