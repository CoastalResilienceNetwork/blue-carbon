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
						var lv = {val2:[189,15],val3:[791,53],val4:[862,125]}
						var lo = "val" + c.currentTarget.value;
						$("#" + t.id + "leg-high").html(lv[lo][0])
						$("#" + t.id + "leg-low").html(lv[lo][1])
						console.log(lv[lo][0])
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
					console.log("click2")
					t.obj.viewStatsOn = c.currentTarget.value;
					$(".areaStats, .storageStats").hide();
					$("." + t.obj.viewStatsOn).show();
				});	
				$(".infoDiv img").click(function(c){
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


				// Bar chart
				// symbolize x-axis
				var l = $('.vertAndLines').find('.dashedLines');  
				$.each(l, function(i,v){
					if (i == l.length - 1){
						$(v).css({'opacity': '1', 'border-top': '2px solid #3d3d3d'})
					}
				})
			},
			updateBarGraphs: function(t){
				var totc = t.atts["Total_C"];
				var ta = 0;
				var ndct = t.atts["NDC_Target"];
				var na = 0;
				var pp = 0;
				if (ndct != -999){
					$("#"+t.id+"ndcTargetBar").show();
					if (totc > ndct){
						ta = 100;
						pp = t.atts["Pcnt_prot"];
						na = ndct/totc*100;
						if (na < 4){na=3}
					}else{
						na = 100;
						ta = totc/ndct*100;
						if (ta < 5){ta=4}
						pp = ta * t.atts["Pcnt_prot"] / 100;
					}
				}else{
					$("#"+t.id+"ndcTargetBar").hide();
					ta = 100;
					pp = t.atts["Pcnt_prot"];
					na = 0;
				}
				var a = [ta,pp,na];
				var b = [totc,ndct];

				var colors = ['#60a6c7','#a6c760','rgba(255,255,255,0)','#0096d6','#f4f4f4']
				// update bar graph
				$('.barHolder').find('.sumBars').each(function(i,v){
					$(v).css("background-color", colors[i]);
					$(v).animate({ height: a[i] + '%'});
				});
			},
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
        });
    }
);
