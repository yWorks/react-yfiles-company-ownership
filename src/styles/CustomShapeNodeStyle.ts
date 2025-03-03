import {
  Fill,
  GeneralPath,
  GeneralPathNodeStyle,
  type INode,
  type IRenderContext,
  NodeStyleBase,
  Point,
  Rect,
  Stroke,
  type Visual
} from '@yfiles/yfiles'
import { EntityType } from '../CompanyOwnership.tsx'

/**
 * A node style implementation that creates shapes based on a given node's type by delegating to GeneralPathNodeStyle.
 */
export class CustomShapeNodeStyle extends NodeStyleBase {
  private readonly gpNodeStyle: GeneralPathNodeStyle

  /**
   * Creates the custom style for the given type of node.
   */
  constructor(
    public type: EntityType,
    public stroke?: Stroke,
    public fill?: Fill
  ) {
    super()
    this.type = type
    this.stroke = Stroke.from(stroke ?? 'black')
    this.fill = Fill.from(fill ?? 'white')

    let gp: GeneralPath
    this.gpNodeStyle = new GeneralPathNodeStyle()
    this.gpNodeStyle.stroke = this.stroke
    this.gpNodeStyle.fill = this.fill

    switch (type) {
      case 'Corporation':
        gp = createCorporationPath()
        break
      case 'CTB':
        gp = createCtbPath()
        break
      case 'Partnership':
        gp = createPartnershipPath()
        break
      case 'RCTB':
        gp = createRctbPath()
        break
      case 'Branch':
      case 'Individual':
      case 'Unknown':
        gp = createBranchPath()
        break
      case 'Disregarded':
        gp = createDisregardedPath()
        break
      case 'Dual Resident':
        gp = createDualResidentPath()
        break
      case 'Multiple':
        gp = createMultiplePath()
        break
      case 'Trust':
        gp = createTrustPath()
        break
      case 'Third Party':
        gp = createThirdPartyPath()
        break
      case 'Trapezoid':
        gp = createTrapezoidPath()
        break
      case 'PE_Risk':
        this.gpNodeStyle.stroke = new Stroke({
          fill: this.stroke.fill!,
          thickness: 2,
          dashStyle: 'dash',
          lineCap: 'square'
        })
        this.gpNodeStyle.stroke.freeze()
        gp = createPeRiskPath()
        break
      case 'Asset':
        gp = createAssetPath()
        break
      case 'Octagon':
        gp = createOctagonPath()
        break
      case 'Bank':
        gp = createBankPath()
        break
      default:
        throw new Error('Unknown Type')
    }

    this.gpNodeStyle.path = gp
    this.gpNodeStyle.cssClass = `company-node company-node-${type
      .toLowerCase()
      .replace(/[_\s]/g, '-')}`
  }

  /**
   * Creates the visual for the given node.
   * @param renderContext The render context
   * @param node The node to which this style is assigned
   * @see Overrides {@link NodeStyleBase.createVisual}
   */
  createVisual(renderContext: IRenderContext, node: INode): Visual | null {
    return this.gpNodeStyle.renderer
      .getVisualCreator(node, this.gpNodeStyle)
      .createVisual(renderContext)
  }

  /**
   * Updates the visual for the given node.
   * @param renderContext The render context
   * @param oldVisual The visual that has been created in the call to createVisual
   * @param node The node to which this style is assigned
   */
  updateVisual(renderContext: IRenderContext, oldVisual: Visual, node: INode): Visual | null {
    return this.gpNodeStyle.renderer
      .getVisualCreator(node, this.gpNodeStyle)
      .updateVisual(renderContext, oldVisual)
  }

  /**
   * Gets the outline of the visual style.
   * @param node The node to which this style is assigned
   */
  getOutline(node: INode): GeneralPath | null {
    switch (this.type) {
      case 'Asset':
      case 'Bank':
      case 'Branch':
      case 'Individual':
      case 'Multiple':
      case 'Octagon':
      case 'PE_Risk':
      case 'Partnership':
      case 'Third Party':
      case 'Trust':
      case 'Unknown':
        return this.gpNodeStyle.renderer.getShapeGeometry(node, this.gpNodeStyle).getOutline()
      default:
        return null
    }
  }
}

/**
 * Creates the path for nodes of type "partnership".
 * @returns The general path that describes this style
 */
function createPartnershipPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 1)
  gp.lineTo(0.5, 0)
  gp.lineTo(1, 1)
  gp.close()
  return gp
}

/**
 * Creates the path for nodes of type "RCTB".
 * @returns The general path that describes this style
 */
function createRctbPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(1, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.close()
  gp.moveTo(1, 0)
  gp.lineTo(0.5, 1)
  gp.lineTo(0, 0)
  return gp
}

/**
 * Creates the path for nodes of type "Trapezoid".
 * @returns The general path that describes this style
 */
function createTrapezoidPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(1, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.close()
  gp.moveTo(0.2, 0)
  gp.lineTo(0.8, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.lineTo(0.2, 0)
  return gp
}

/**
 * Creates the path for nodes of type "Branch".
 * @returns The general path that describes this style
 */
function createBranchPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.appendEllipse(new Rect(0, 0, 1, 1), false)
  return gp
}

/**
 * Creates the path for nodes of type "Disregarded".
 * @returns The general path that describes this style
 */
function createDisregardedPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(1, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.close()
  gp.appendEllipse(new Rect(0, 0, 1, 1), false)
  return gp
}

/**
 * Creates the path for nodes of type "Dual_Resident".
 * @returns The general path that describes this style
 */
function createDualResidentPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(1, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.close()
  gp.moveTo(0, 1)
  gp.lineTo(1, 0)
  return gp
}

/**
 * Creates the path for nodes of type "Multiple_Path".
 * @returns The general path that describes this style
 */
function createMultiplePath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(0.9, 0)
  gp.lineTo(0.9, 0.9)
  gp.lineTo(0, 0.9)
  gp.close()
  gp.moveTo(0.9, 0.1)
  gp.lineTo(1, 0.1)
  gp.lineTo(1, 1)
  gp.lineTo(0.1, 1)
  gp.lineTo(0.1, 0.9)
  gp.lineTo(0.9, 0.9)
  gp.close()
  return gp
}

/**
 * Creates the path for nodes of type "Trust".
 * @returns The general path that describes this style
 */
function createTrustPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0.5)
  gp.lineTo(0.5, 0)
  gp.lineTo(1, 0.5)
  gp.lineTo(0.5, 1)
  gp.close()
  return gp
}

/**
 * Creates the path for nodes of type "PE_Risk".
 * @returns The general path that describes this style
 */
function createPeRiskPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.appendEllipse(new Rect(0, 0, 1, 1), false)
  return gp
}

/**
 * Creates the path for nodes of type "Third_Party".
 * @returns The general path that describes this style
 */
function createThirdPartyPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0.25273825759228363, 0.2106077406985223)
  gp.cubicTo(
    new Point(0.37940464379944383, 0.008533694660719517),
    new Point(0.5427384738867617, -0.07436838307589484),
    new Point(0.7327381431952041, 0.20542116176184805)
  )
  gp.cubicTo(
    new Point(0.9727395859583705, 0.2054237109534111),
    new Point(1.026070204427681, 0.5059367593821318),
    new Point(0.9360671322061148, 0.6302855466359552)
  )
  gp.cubicTo(
    new Point(0.9727385659844104, 1.0499824248785579),
    new Point(0.7327384631870348, 0.9929823150021839),
    new Point(0.5727383979886994, 0.9308125068113157)
  )
  gp.cubicTo(
    new Point(0.37607164889080386, 1.044795193100142),
    new Point(0.23606605323366095, 0.9878057307616991),
    new Point(0.17274109991971903, 0.8064517974237797)
  )
  gp.cubicTo(
    new Point(-0.1039264767570484, 0.68210650753643),
    new Point(0.012736869827713297, 0.2572344906314848),
    new Point(0.25273825759228363, 0.2106077406985223)
  )
  gp.close()
  return gp
}

/**
 * Creates the path for nodes of type "Corporation".
 * @returns The general path that describes this style
 */
function createCorporationPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(1, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.close()
  return gp
}

/**
 * Creates the path for nodes of type "CTB".
 * @returns The general path that describes this style
 */
function createCtbPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0)
  gp.lineTo(1, 0)
  gp.lineTo(1, 1)
  gp.lineTo(0, 1)
  gp.close()
  gp.moveTo(0, 1)
  gp.lineTo(0.5, 0)
  gp.lineTo(1, 1)
  return gp
}

/**
 * Creates the path for nodes of type "Octagon".
 * @returns The general path that describes this style
 */
function createOctagonPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0.25, 0)
  gp.lineTo(0.75, 0)
  gp.lineTo(1, 0.25)
  gp.lineTo(1, 0.75)
  gp.lineTo(0.75, 1)
  gp.lineTo(0.25, 1)
  gp.lineTo(0, 0.75)
  gp.lineTo(0, 0.25)
  gp.close()
  return gp
}

/**
 * Creates the path for nodes of type "Asset".
 * @returns The general path that describes this style
 */
function createAssetPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0, 0.5)
  gp.lineTo(0.25, 0)
  gp.lineTo(0.75, 0)
  gp.lineTo(1, 0.5)
  gp.lineTo(0.75, 1)
  gp.lineTo(0.25, 1)
  gp.lineTo(0, 0.5)
  gp.close()
  return gp
}

/**
 * Creates the path for nodes of type "Bank".
 * @returns The general path that describes this style
 */
function createBankPath(): GeneralPath {
  const gp = new GeneralPath()
  gp.moveTo(0.5, 0.0)
  gp.lineTo(0.0, 0.47)
  gp.lineTo(0.191, 1)
  gp.lineTo(0.809, 1)
  gp.lineTo(1.0, 0.47)
  gp.lineTo(0.5, 0.0)

  gp.close()
  return gp
}
