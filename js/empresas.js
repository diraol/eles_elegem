var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

var empresas = ["JBS"]
var formatNumber = d3.format(",d")

function muda_empresa(d) {
    var selecionados = getValue()
    empresas = arruma_select(selecionados)
    atualizar()
}

function arruma_select(selecionados) {
    var diferente = null
    for (d in selecionados) {
        if (empresas.indexOf(selecionados[d]) == -1) {
            diferente = selecionados[d]
        }
    }
    if (diferente != null) {
        var temp = empresas
        temp.push(diferente)

    } else {
        var temp = []
        for (d in empresas) {
            if (selecionados.indexOf(empresas[d]) == -1 ){
                temp.push(empresas[d])
            }
        }
    }
    $("#doadores").val(temp)
    return temp
}
function getValue() {
  var x=document.getElementById("doadores");
  var saida = []
  for (var i = 0; i < x.options.length; i++) {
     if(x.options[i].selected ==true){
          saida.push(x.options[i].value);
      }
  }
  return saida
}

function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
}

function filtra_dados(deus) {
    var links = []
    var nodes = deus.nodes
    for (e in window.empresas) {
        var empresa = empresas[e]
        var teste = deus.links
        novos_links = teste.filter(function (d) { return d.empresa == empresa})
        links = links.concat(novos_links)
    }
    return [links,nodes ]
}

function busca_candidato(nodes,candidato) {
    var saida = null
    nodes.forEach(function (d) { if (d.name == candidato) { saida = d.index } })
    return saida
}
var arquivo = null

var width = 1500,
    height = 900;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-600)
    .linkDistance(-50)
    .gravity(0.3)
    .linkStrength(0.45)
    .friction(0.4)
    .chargeDistance(50000)
    .size([width, height]);


var drag = force.drag()
    .on("dragstart", dragstart);

var svg = null
var teste = null

function atualizar() {
    svg.remove()
    iniciar()
}

function acha_cor(d) {
    if (d.group ==1) {
        return "#4d5266"
    } else {
        if (d.partido == "PT") return "#690000"
        else if (d.partido == "PSDB") return "#1e2e66"
        else if (d.partido == "PMDB") return "#6b4200"
        else if (d.partido == "PSD") return "#4f5d15"
        else if (d.partido == "PP") return "#a6546f"
        else return "#666e87"
    }
}

function carrega_dados() {
    d3.json("jbs.json", function(error, dados) {
        arquivo = dados
        iniciar()
    })
}

function iniciar() {
    var dados = arquivo
    console.log(dados)
    var svg = d3.select("#grafico").append("svg")
          .attr("width", width)
          .attr("height", height);
        
    var filtrado = filtra_dados(dados)
    var graph = {}
    graph.links = filtrado[0]
    graph.nodes = filtrado[1]

    var grafico = force
          .nodes(graph.nodes)
          .links(graph.links)
          .start();
    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
          .attr("class", "link")
          .style("stroke-width", function(d) { return Math.sqrt(d.value); });

    var max = d3.max(graph.nodes, function(d) { return d.valor; });
    var min = d3.min(graph.nodes, function(d) { return d.valor; });

    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", function (d) { if (d.group == 1) {return Math.max(70*(d.valor/54577777),8) } else { return 5}})
        .style("fill", function(d) {
            //    return color(d.group);
                return acha_cor(d)
        })
        .style("stroke",function (d) {
                  //return "#fff"
              return acha_cor(d)
        })
        .style("fill-opacity", function (d) {
             if (d.group ==1 ) return 1
             else return 0.35
        })
        .style("stroke-opacity",0.5)

        .call(drag);

    node.append("title")
          .text(function(d) { return d.name; });
    node.on('mouseover', function(d) {

          div.transition()
                  .duration(200)
                  .style("opacity", 1);
          if (d.group == 3) {
              div.html(d.name + " ("+ d.partido+")")
          } else {
              div.html("<b>"+d.name+"</b><br>Total doado: R$"+formatNumber(Math.round(d.valor)).replace(",",".").replace(",","."))
          }
          div.style("left", (d3.event.pageX - 20) + "px")
             .style("top", (d3.event.pageY - 50) + "px")})

    node.on('mousemove', function(d) {
         div.style("left", (d3.event.pageX - 20) + "px")
            .style("top", (d3.event.pageY - 50) + "px");
    })

    node.on("mouseout", function(d) {
        div.transition()
                .duration(500)
                .style("opacity", 0);
    });

    node.on("click",function(d) {
        if (d.group == 1) {
            selecionados = $("#doadores").val()
            if (selecionados == null) { selecionados = []}
            if (selecionados.indexOf(d.name) == -1) selecionados.push(d.name)
            else {
                var saida = []
                for (s in selecionados) {
                    if (selecionados[s] != d.name) {
                        saida.push(selecionados[s])
                        }
                    }
                selecionados = saida
                }
            $("#doadores").val(selecionados)
            empresas = selecionados
            atualizar()
        }
    })

    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    });
    window.svg = svg

}

carrega_dados();
