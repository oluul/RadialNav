import makerjs from 'makerjs';
import './main.scss';

class RadialNav {
  constructor(svg, props = {}) {
    this.canvas = Snap(svg);
    this.props = {
      debug: props.debug || false,
      width: props.width || 90,
      radius: props.radius || 200,
      spacing: props.spacing || 10,
      fillet: props.fillet || 10,
      onClick: props.onClick || null,
      childs: props.childs || []
    };

    this.init();
  }

  init() {
    this.mainGroup = this.canvas.group();
    this.group = this.mainGroup.group();

    this.drawNav();

    const groupBBox = this.mainGroup.getBBox();

    if (this.props.debug) {
      this.renderGrid();
    }

    this.mainGroup
      .transform(`t${groupBBox.w/2+10},${groupBBox.h/2+10}`)
      .attr({ class: 'g-main'});

    this.group.attr({
      class: 'g-navs',
      fill: this.canvas.gradient("l(1, 1, 0, 0)#da1317-#b10c0f"),
    });

    this.canvas.attr({
      width: groupBBox.w + 20,
      height: groupBBox.h + 20
    });
  }

  renderGrid() {
    const grid = this.mainGroup.group().attr({class: 'g-debug'});
    grid.line(-(this.props.radius+this.props.width*2), 0, (this.props.radius+this.props.width*2),0).attr({ stroke: 'green', strokeOpacity: 0.2 })
    grid.line(0, -(this.props.radius+this.props.width*2), 0, (this.props.radius+this.props.width*2)).attr({ stroke: 'green', strokeOpacity: 0.2 })
    grid.circle(0, 0, 10).attr({ stroke: 'green', fill: 'transparent', strokeOpacity: 0.6 });
    grid.circle(0, 0, 30).attr({ stroke: 'green', fill: 'transparent', strokeOpacity: 0.6 });
    grid.circle(0, 0, 50).attr({ stroke: 'green', fill: 'transparent', strokeOpacity: 0.6 });
    grid.circle(this.props.radius, 0, 3).attr({ fill: 'green', fillOpacity: 0.6 });
    grid.circle(-this.props.radius, 0, 3).attr({ fill: 'green', fillOpacity: 0.6 });
    grid.circle(0, this.props.radius, 3).attr({ fill: 'green', fillOpacity: 0.6 });
    grid.circle(0, -this.props.radius, 3).attr({ fill: 'green', fillOpacity: 0.6 });
  }

  drawNav() {
    for (let i = 0; i < this.props.childs.length; i++ ) {
      const child = this.props.childs[i];
      const paths = this.getNavPath(i);
      const nav = this.group.group().attr({ class: 'g-nav'});

      const p = nav.path(paths.wrapper)
        .attr({ cursor: "pointer" })
        .click(evt => this.props.onClick(event, child));

      nav.text(0, 0, child.label)
        .attr({
          class: 'n-label',
          textpath: paths.secondaryTextPath,
          "text-anchor": "middle",
          "pointer-events": "none",
        }).textPath.attr({
          "startOffset": "50%",
          "alignment-baseline": "middle"
        });

      nav.text(0, 0, child.icon)
        .attr({
          class: 'n-icon',
          textpath: paths.primaryTextPath,
          "text-anchor": "middle",
          "pointer-events": "none",
          fill: '#fff'
        }).textPath.attr({
          class: 'iconfont',
          "startOffset": "50%",
          "alignment-baseline": "middle"
        });

      nav.hover(() => {
        nav.attr({
          fillOpacity: 0.85
        });
      }, () => {
        nav.attr({
          fillOpacity: 1
        })
      })
    }
  }

  getNavPath(idx) {
    // console.log('this.props.fillet:', this.props.fillet)
    const { spacing, radius, width, childs } = this.props;
    const child = childs[idx];
    const origin = [0, 0];
    const itemModel = { paths: {} };
    const perAngle = 360/childs.length;
    const startAngle = perAngle * idx;
    const endAngle = perAngle * (idx + 1);
    const outerSpaceAngle = (180 * spacing) / (Math.PI * (radius + width));
    const innerSpaceAngle = (180 * spacing) / (Math.PI * radius);

    itemModel.paths.outerRing = new makerjs.paths.Arc(
      origin,
      radius + width,
      (startAngle + outerSpaceAngle/2),
      (endAngle - outerSpaceAngle/2));
    itemModel.paths.innerRing = new makerjs.paths.Arc(
      origin,
      radius,
      (startAngle + innerSpaceAngle/2),
      (endAngle - innerSpaceAngle/2));

    const outerRingPoints = makerjs.path.toKeyPoints(itemModel.paths.outerRing);
    const innerRingPoints = makerjs.path.toKeyPoints(itemModel.paths.innerRing);

    itemModel.paths.line1 = new makerjs.paths.Line(outerRingPoints[outerRingPoints.length-1], innerRingPoints[innerRingPoints.length-1]);
    itemModel.paths.line2 = new makerjs.paths.Line(innerRingPoints[0], outerRingPoints[0]);
    itemModel.paths.outerFillet1 = makerjs.path.fillet(itemModel.paths.outerRing, itemModel.paths.line1, this.props.fillet);
    itemModel.paths.outerFillet2 = makerjs.path.fillet(itemModel.paths.outerRing, itemModel.paths.line2, this.props.fillet);
    itemModel.paths.innerFillet1 = makerjs.path.fillet(itemModel.paths.innerRing, itemModel.paths.line1, this.props.fillet);
    itemModel.paths.innerFillet2 = makerjs.path.fillet(itemModel.paths.innerRing, itemModel.paths.line2, this.props.fillet);

    const primaryTextPath = new makerjs.paths.Arc(origin, radius + width*0.3, startAngle, endAngle);
    const secondaryTextPath = new makerjs.paths.Arc(origin, radius + width*0.6, startAngle, endAngle);

    return {
      wrapper: makerjs.exporter.toSVGPathData(itemModel, false, [0, 0]),
      primaryTextPath: makerjs.exporter.toSVGPathData({ paths: { primaryTextPath } }, false, [0, 0]),
      secondaryTextPath: makerjs.exporter.toSVGPathData({ paths: { secondaryTextPath } }, false, [0, 0])
    };
  }
}

window.RadialNav = RadialNav;
