define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask", "esri/graphicsUtils"
],
function ( declare, Query, QueryTask, graphicsUtils ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				$("#" + t.id + "countrySelect").chosen({allow_single_deselect:true, width:"98%"})
					.change(function(c){
						if (c.target.value.length > 0){
							var val = c.target.value;
							var q = new Query();
							var qt = new QueryTask(t.url + "/0" );
							q.where = "CNTRY_NAME = '"+val+"'";
							q.returnGeometry =true;
							q.outFields = ["*"];
							t.atts = [];
							qt.execute(q, function(e){
								t.map.graphics.clear();
								var f = e.features[0];
								f.setSymbol(t.sym1);
								t.map.graphics.add(f);
								t.map.setExtent(f.geometry.getExtent(), true)
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
								// set bar ranges
								// var area = f.attributes.Area_ha;
								// var prot = f.attributes.Area_Prot;
								// var protPer = prot/area*100;
								// console.log(protPer)
								// var score = 0;
								// if (area < 624754.602000){score = 1}
								// if (area >= 1249502.644000 && area < 1874250.686000){score = 2}
								// if (area >= 1874250.686000 && area < 2498998.728000){score = 3}
								// if (area >= 2498998.728000 && area < 3123746.770000){score = 4}
								// if (area >= 3123746.770000 ){score = 5}
								// var areaHeight = score/5*100;
								// var protHeight = score/5*protPer;
								// var a = [areaHeight,protHeight];
								// console.log(a)
								// t.clicks.updateBarGraphs(a,t);
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
				// calculate width of bars
				// var bars = $('.barHolder').find('.sumBarsWrap');
				// var lw = $('.dashedLines').css('width').slice(0,-2)
				// var sLw = lw/bars.length;
				// var bWw = sLw - bars.length;
				// $('.smallLabels').css('width', sLw + 'px')
				// $('.sumBarsWrap').css('width', bWw + 'px')
				// $('.sumBars').css('width', bWw-20 + 'px')
				
				var a = [30,25];
				t.clicks.updateBarGraphs(a,t);
			},
			updateBarGraphs: function(a,t){
				var colors = ['#fff74c','#ed9a50','#e74949','#0096d6','#f4f4f4']
				// update bar graph
				$('.barHolder').find('.sumBars').each(function(i,v){
					$(v).css("background-color", colors[i]);
					$(v).animate({ height: a[i] + '%'});
					$(v).find(".barLabel").html( a[i] )
				});
			},
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
        });
    }
);
