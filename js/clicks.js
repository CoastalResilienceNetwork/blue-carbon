define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask", "esri/graphicsUtils"
],
function ( declare, Query, QueryTask, graphicsUtils ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				$("#" + t.id + "countrySelect").chosen({allow_single_deselect:false, width:"98%"})
					.change(function(c){
						if (c.target.value.length > 0){
							var val = c.target.value;
							t.obj.country = val;
							var q = new Query();
							var qt = new QueryTask(t.url + "/0" );
							q.where = "CNTRY_NAME = '"+val+"'";
							q.returnGeometry = true;
							q.outFields = ["*"];
							t.atts = [];
							qt.execute(q, function(e){
								// add graphic
								t.map.graphics.clear();
								var f = e.features[0];
								t.atts = f.attributes;	
								t.clicks.updateBarGraphs(t);
								
								f.setSymbol(t.sym1);
								t.map.graphics.add(f);
								// extent query
								var qt1 = new QueryTask(t.url + "/5");
								qt1.execute(q, function(e1){
									var f1 = e1.features[0];
									t.map.setExtent(f1.geometry.getExtent(), true)
								})
								// handle stats
								$("#"+t.id+"ndcLabel").show();
								$("#" + t.id + "stats-wrap .stat-num").each(function(i,v){
									var field = v.id.split("-").pop()
									var r = 0
									if (field == "NDC_Target" && t.atts[field] == -999){
										$(v).html("No NDC Target");
										$("#"+t.id+"ndcLabel").hide();	
									}else{
										r = Math.round(t.atts[field])	
										$(v).html( t.clicks.numberWithCommas(r) )
									}	
								})
								$("#" + t.id + "stats-wrap").show();
								if (t.atts["NDC_Text"]){
									$("#"+t.id+"NDC_Text").html(t.atts["NDC_Text"])
								}else{
									$("#"+t.id+"NDC_Text").html("");
								}
							})
							t.map.graphics.clear();
						}else{
							$("#" + t.id + "stats-wrap").hide();
						}	
						t.map.setMapCursor("pointer");
					});	
				$("#" + t.id + "cmc input").click(function(c){
					if (c.currentTarget.name == "cs"){
						var lv = {val2:[700,50],val3:[3200,150],val4:[3590,50]}
						var lo = "val" + c.currentTarget.value;
						$("#" + t.id + "leg-high").html(t.clicks.numberWithCommas(lv[lo][0]))
						$("#" + t.id + "leg-low").html(t.clicks.numberWithCommas(lv[lo][1]))
					}else{
						if (c.currentTarget.checked){
							$("#" + t.id + "leg-protected").show();	
						}else{
							$("#" + t.id + "leg-protected").hide();
						}
					}
					$("#" + t.id + "cmc input").each(function(i,v){
						var val = v.value;
						var index = t.obj.visibleLayers.indexOf(val);
						if( $(v).is(":checked") ){
							if (index == -1){
								t.obj.visibleLayers.push(v.value)
							}	
						}else{
							if (index > -1){
								t.obj.visibleLayers.splice(index, 1);
							}
						}
					})
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				})
				$("#" + t.id + "viewStatsOnToggle input[name='so']").click(function(c){
					t.obj.viewStatsOn = c.currentTarget.value;
					$(".areaStats, .storageStats").hide();
					$("." + t.obj.viewStatsOn).show();
				});	
				$(".infoDiv i").click(function(c){
					$(".infoOpen, .infoClose").toggle();
					$("#" + t.id + "infoBox").slideToggle();
				})
				// map clicks
				t.map.on("click",function(c){
					if (t.open == "yes"){
						var q = new Query();
						var qt = new QueryTask(t.url + "/0" );
						q.geometry = c.mapPoint;
						q.where = "CNTRY_NAME <> 'Global'";
						q.returnGeometry = true;
						qt.execute(q, function(e){
							if (e.features[0]){
								var c = e.features[0].attributes.CNTRY_NAME;
								$("#" + t.id + "countrySelect").val(c).trigger("chosen:updated").change();
							}	
						})
					}
				})
			},
			updateBarGraphs: function(t){
				if (t.atts["NDC_Target"] == -999){
					$(`.wNdc`).hide();
					$(`.woNdc`).show();
					$(`.ndcWrap`).css("left",`0%`);
				}else{
					$(`.woNdc`).hide();
					$(`.wNdc`).show();
					const rv = t.clicks.numberWithCommas(t.atts["Tot_Restore"].toFixed(3));
					const av = t.clicks.numberWithCommas(t.atts["Tot_Avd_Loss"].toFixed(3));
					const tv = t.clicks.numberWithCommas(t.atts["Tot_Opp"].toFixed(3));
					const ndc = t.clicks.numberWithCommas(t.atts["NDC_Target"].toFixed(3));
					const ndcy = t.atts["NDC_Year"];
					$(`#${t.id}restoreVal`).html(rv)
					$(`#${t.id}avoidVal`).html(av)
					$(`#${t.id}totVal`).html(tv)
					$(`#${t.id}ndcVal`).html(ndc)
					$(`#${t.id}ndcYear`).html(ndcy)

					if (t.atts["NDC_Text"]){
						$(`#${t.id}ndcText`).html(t.atts["NDC_Text"])
					}else{
						$(`#${t.id}ndcText`).html("NDC Target");
					}

					const rw = t.atts["Tot_Restore"] / t.atts["Tot_Opp"] * 100;
					const aw = t.atts["Tot_Avd_Loss"] / t.atts["Tot_Opp"] * 100;
					const ndcw = Math.round(t.atts["NDC_Target"] / t.atts["Tot_Opp"] * 100);
					$(`#${t.id}ndcPer`).html(ndcw)
				}
			},
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
        });
    }
);
