class Hypergraph{
    constructor(hyper_data){
        this.nodes = hyper_data.nodes;
        this.links = hyper_data.links;

        console.log(this.links, this.nodes)

        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        this.colorScale.domain(hyper_data.nodes.map(d => d.id));

        this.svg_width = 1000;
        this.svg_height = 1000;
        this.svg = d3.select("#hypergraph-svg")
            .attr("viewBox", [0, 0, this.svg_width, this.svg_height]);
        this.svg_g = this.svg.append("g");

        this.links_group = this.svg_g.append("g")
            .attr("id", "hyper_links_group");
        this.nodes_group = this.svg_g.append("g")
            .attr("id", "hyper_nodes_group");

        this.draw_hypergraph();
        this.toggle_hgraph_labels();
    }

    draw_hypergraph(){
        let node_radius = 8;

        let simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.links).id(d => d.id))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(this.svg_width/2, this.svg_height/2));

        let ng = this.nodes_group.selectAll("g").data(this.nodes);
        ng.exit().remove();
        ng = ng.enter().append("g").merge(ng);
        ng.append("circle")
            .attr("r", node_radius)
            .attr("fill", d => d["bipartite"] === 1 ? this.colorScale(d.id) : "") // only color nodes that representing hyper-edges
            // .attr("stroke", d => d["bipartite"] === 1 ? "#fff" : "")
            .attr("stroke", "#fff")
            .attr("stroke-width", d => d["bipartite"] === 1 ? 5 : 2)
            .attr("id", d => d.id);
        ng.append("text")
            .attr("dx", 12)
            .attr("dy", "0.35em")
            .attr("class", "node-label")
            .text(d=>d.id);

        let lg = this.links_group.selectAll("line").data(this.links);
        lg.exit().remove();
        lg = lg.enter().append("line").merge(lg)
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", d => Math.sqrt(d.value));

        // add drag capabilities
        const drag_handler = d3.drag()
            .on("start", drag_start)
            .on("drag", drag_drag)
            .on("end", drag_end);

        //add zoom capabilities
        const zoom_handler = d3.zoom()
            .on("zoom", zoom_actions);

        drag_handler(ng);
        zoom_handler(this.svg);

        // Drag functions
        // d is the node
        function drag_start(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        //make sure you can"t drag the circle outside the box
        function drag_drag(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function drag_end(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        let that = this;
        //Zoom functions
        function zoom_actions() {
            that.svg_g.attr("transform", d3.event.transform);
        }

        simulation.on("tick", () => {
            lg
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            ng
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
        });


    }

    toggle_hgraph_labels(){
        try {
            // Set show-labels to true at beginning
            d3.select("#hgraph-labels").property("checked", true);
            d3.select("#hgraph-labels").on("change", update_labels);
    
            function update_labels() {
                if (d3.select("#hgraph-labels").property("checked")) {
                    d3.selectAll(".node-label").attr("visibility", "visible");
    
                } else {
                    d3.selectAll(".node-label").attr("visibility", "hidden");
                }
            }
        } catch (e) {
            console.log(e);
        }                       
    }
}