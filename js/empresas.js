var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

var empresas = ["JBS"],
  groups = null,
  candidatos = {},
  mudou = null,
  formatNumber = d3.format(",d"),
  nodes = [],
  links = [],
  arquivo = null,
  width = $("#grafico").width() -20,
  height = $("#grafico").height(),
  color = d3.scale.category20(),
  formatNumber = d3.format(",d")
  clusters = {};

var svg = d3.select("#grafico").append("svg")
  .attr("width", width)
  .attr("height", height);

var force = d3.layout.force()
  .nodes(nodes)
  .links(links)
  .charge(-600)
  .linkDistance(-50)
  .gravity(0.3)
  .linkStrength(0.45)
  .friction(0.4)
  .chargeDistance(50000)
  .size([width, height])
  .on("tick", tick);

var drag = force.drag()
  .on("dragstart", dragstart);

var node = svg.selectAll(".node"),
  link = svg.selectAll(".link")

var cores = {
    "PT"       :["#a00200",1],
    "PST"      :["#a51001",2],
    "PL"       :["#aa1d01",3],
    "PTC"      :["#b02b01",4],
    "PC do B"    :["#b53901",5],
    "PP"       :["#ba4601",6],
    "PRB"      :["#bf5301",7],
    "PSL"      :["#c46102",8],
    "PPL"      :["#ca6f03",9],
    "PSB"      :["#cf7d03",10],
    "PMDB"     :["#d48b03",11],
    "PROS"     :["#d99803",12],
    "PRTB"     :["#dea604",13],
    "PTB"      :["#e4b304",14],
    "PRP"      :["#e9c104",15],
    "PDT"      :["#eece04",16],
    "PHS"      :["#f3dc05",17],
    "PR"       :["#f4e509",18],
    "PSC"      :["#eae116",19],
    "PMR"      :["#dfdd24",20],
    "PT do B"    :["#d5d931",21],
    "PV"       :["#cad63e",22],
    "PMN"      :["#c0d24b",23],
    "PSD"      :["#b6ce58",24],
    "PEN"      :["#abc966",25],
    "PTN"      :["#abc966",25],
    "SD"      :["#a1c673",26],
    "PSOL"     :["#97c281",27],
    "PPS"      :["#8cbe8e",28],
    "DEM"      :["#82ba9b",29],
    "PFL_DEM"  :["#77b6a8",30],
    "PSDB"     :["#6db3b6",31],
    "PRONA"    :["#62afc3",32],
    "PAN"      :["#58abd0",33],
    "PSDC"     :["#4da7de",34],
    // "ZZZ"   :["#43a3eb",35],
    "S.Part."   :["#999999",35]
}


d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};

function muda_empresa() {
  atualizar()
}

function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
}

function filtra_dados(deus) {
  var temp = deus.links.filter(function(d) {
    return empresas.indexOf(d.empresa) != -1
  })
  var candi = []
  temp.forEach(function(d) {
    candi.push(d.candidato)
  })
  candi = candi.concat(empresas)
  var novos_nodes = deus.nodes.filter(function(d) {
    return candi.indexOf(d.name) != -1
  })
  var novos_links = []
  var temp_empresas = deus.nodes.filter(function(d) {
    return empresas.indexOf(d.name) != -1
  })
  var trad_empresas = {}
  temp_empresas.forEach(function(d, e) {
    trad_empresas[d.name] = e
  })
  novos_nodes.forEach(function(d) {
    var empresas_nesse_caso = []
    temp.forEach(function(ligacao) {
      if (ligacao.candidato == d.name) empresas_nesse_caso.push(ligacao.empresa)
    })
    empresas_nesse_caso.forEach(function(emp) {
      var ligacao = {
        source: d,
        target: temp_empresas[trad_empresas[emp]],
        value: candidatos[d.name][emp]
      }
      novos_links.push(ligacao)
    })
  })
  return [novos_links, novos_nodes]
}

function busca_candidato(nodes_temp, candidato) {
  var saida = null
  nodes_temp.forEach(function(d) {
    if (d.name == candidato) {
      saida = d.index
    }
  })
  return saida
}


function acha_cor(d) {
  if (d.group == 1) {
    return "#4d5266"
  } else {
    return cores[d.partido][0]
  }
}

function carrega_dados() {
  d3.json("jbs.json", function(error, dados) {
    arquivo = dados
    preenche_candidatos()
    comecar()
  })
}

function start() {
  link = link.data([])
  link.exit().remove()

  link = link.data(links)
  link.enter().append("line")
    .attr("name", function(d) {
      return d.target.name
    })
    .attr("class", "link")
    .style("stroke-width", function(d) {
      return Math.max(Math.sqrt(Math.sqrt(Math.sqrt(d.value))) - 2, 0.5);
    });
  link.exit().remove();

  node = node.data(force.nodes(), function(d) {
    return d.name;
  });
  node.enter().append("circle")
    .attr("class", "node")
    .attr("name", function(d) {
      return d.name
    })
    .attr("r", function(d) {
      if (d.group == 1) {
        return Math.max(70 * (d.valor / 54577777), 8)
      } else {
        return 5
      }
    })
    .style("fill", function(d) {
      //    return color(d.group);
      return acha_cor(d)
    })
    .style("stroke", function(d) {
      //return "#fff"
      return "#fff"
    })
    .style("fill-opacity", function(d) {
      if (d.group == 1) return 1
      else return 0.35
    })
    .style("stroke-opacity", 0.5)

  .call(drag);

  node.on('mouseover', function(d) {

    div.transition()
      .duration(200)
      .style("opacity", 1);
    if (d.group == 3) {
      div.html(d.name + " (" + d.partido + ")</br>" + acha_doacoes(d.name))
    } else {
      div.html("<b>" + d.name + "</b><br>Total doado: R$" + formatNumber(Math.round(d.valor)).replace(",", ".").replace(",", "."))
    }
    div.style("left", (d3.event.pageX - 20) + "px")
      .style("top", (d3.event.pageY - 50) + "px")
  })

  node.on('mousemove', function(d) {
    div.style("left", (d3.event.pageX - 20) + "px")
      .style("top", (d3.event.pageY - 50) + "px");
  })

  node.on("mouseout", function(d) {
    div.transition()
      .duration(500)
      .style("opacity", 0);
  });
  //tira o node se clicar em cima
  /*  node.on("click",function(d) {
        if (d3.event.defaultPrevented) return; // click suppressed
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
    })*/
  node.exit().remove();
  force.start()
  d3.selectAll("circle").moveToFront()
  groups = d3.nest()
      .key(function(d) { return d.partido; })
      .map(nodes)  
  for (var key in groups) {
      if (key != "undefined") {
          clusters[key] = groups[key][0]          
      }
  }
  
}

function comecar() {
  var filtrado = filtra_dados(arquivo)
  links = filtrado[0]
  force.links(links)
  nodes = filtrado[1]
  force.nodes(nodes);
  start()
  $("#doadores").trigger("chosen:updated");
}

function preenche_candidatos() {
  var links_local = arquivo["links"]
  var cand = candidatos
  links_local.forEach(function(d) {
    if (!(d["candidato"] in cand)) {
      cand[d["candidato"]] = {}
    }
    cand[d["candidato"]][d["empresa"]] = d.value
  })
  candidatos = cand
}

function acha_doacoes(nome) {
  var doacoes = candidatos[nome]
  var saida = ""
  for (var e in doacoes) {
    saida += "<br><b>" + e + ": </b> R$ " + formatNumber(Math.round(doacoes[e])).replace(",", ".").replace(",", ".")
  }
  return saida
}

function atualizar() {
  var filtrado = filtra_dados(arquivo)
  links = filtrado[0]
  force.links(links)
  nodes = filtrado[1]
  force.nodes(nodes);
  force.stop()
  start()
  $("#doadores").trigger("chosen:updated");

}

function tick(e) {
    
  link.attr("x1", function(d) {
      return d.source.x;
    })
    .attr("y1", function(d) {
      return d.source.y;
    })
    .attr("x2", function(d) {
      return d.target.x;
    })
    .attr("y2", function(d) {
      return d.target.y;
    });
/*
    var k = e.alpha * .1;
    nodes.forEach(function(node) {
      var center = nodes[node.type];
      node.x += (center.x - node.x) * k;
      node.y += (center.y - node.y) * k;
    });
 */   
    node.each(cluster(10 * e.alpha * e.alpha))
    node.attr("cx", function(d) {
      return d.x;
    })
    .attr("cy", function(d) {
      return d.y;
    });
}

function cluster(alpha) {
    alpha = alpha*1.2
  return function(d) {
      if (d.group != 1 ) {
    var cluster = clusters[d.partido];
    if (cluster === d) return;
    var x = d.x - cluster.x,
        y = d.y - cluster.y,
        l = Math.sqrt(x * x + y * y),
        r = 10
    if (l != r) {
      l = (l - r) / l * alpha;
      d.x -= x *= l;
      d.y -= y *= l;
      cluster.x += x;
      cluster.y += y;
    }
  };
  }
}


function toggleSelect(el) {
  var container_selecionadas = $("#empSelecionadas"),
    container_n_selecionadas = $("#empNSelecionadas"),
    item = $(el).parent();
  $(el).toggleClass("selecionada").toggleClass("nao-selecionada").toggleClass("glyphicon").toggleClass("glyphicon-remove-circle");
  if (item.parent()[0].id == "empNSelecionadas") {
    container_selecionadas.append(item);
    empresas.push($(el).text());
  } else {
    container_n_selecionadas.append(item);
    empresas.splice(empresas.indexOf($(el).text()),1);
  }
  $("#empSelecionadas li").sort(sort_comp).appendTo("#empSelecionadas");
  $("#empNSelecionadas li").sort(sort_comp).appendTo("#empNSelecionadas");
  muda_empresa();
}

function sort_comp(a,b) {
    return $(b).data('pos') < $(a).data("pos") ? 1 : -1;
}

carrega_dados();
