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
								// graph numbers
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
								t.clicks.updateBarGraphs(a,b,t);
								
								f.setSymbol(t.sym1);
								t.map.graphics.add(f);
								// extent query
								var qt1 = new QueryTask(t.url + "/5");
								qt1.execute(q, function(e1){
									var f1 = e1.features[0];
									t.map.setExtent(f1.geometry.getExtent(), true)
								})
								// handle stats
								$("#" + t.id + "stats-wrap .stat-num").each(function(i,v){
									var field = v.id.split("-").pop()
									var r = 0
									if (field == "Pcnt_prot"){
										r = Math.round(f.attributes[field]*100)/100
									}else{
										r = Math.round(f.attributes[field])	
									}
									
									$(v).html( t.clicks.numberWithCommas(r) )	
								})
								$("#" + t.id + "stats-wrap").show();
								
							})
							t.map.graphics.clear();
						}else{
							$("#" + t.id + "stats-wrap").hide();
						}	
						t.map.setMapCursor("pointer");
					});	
				$("#" + t.id + "cmc input").click(function(c){
					if (c.currentTarget.name == "cs"){
						var a = ["grad-2","grad-3","grad-4"];
						$.each(a,function(i,v){
							$("#" + t.id + "leg-gradient").removeClass(v)
						})
						$("#" + t.id + "leg-gradient").addClass("grad-" + c.currentTarget.value)
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
			updateBarGraphs: function(a,b,t){
				var colors = ['#60a6c7','#a6c760','rgba(255,255,255,0)','#0096d6','#f4f4f4']
				// update bar graph
				$('.barHolder').find('.sumBars').each(function(i,v){
					$(v).css("background-color", colors[i]);
					$(v).animate({ height: a[i] + '%'});
					//var n = t.clicks.numberWithCommas(b[i]);
					// $(v).find(".barLabel").html( "NDC Target" )
				});
			},
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
        });
    }
);
