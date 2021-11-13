package calculator;

import cern.colt.matrix.impl.DenseDoubleMatrix2D;
import cern.colt.matrix.linalg.Algebra;

public class AdvancedCalculator {
  private AdvancedCalculator() {};

  static double mult(double a, double b) {
    double [][] firstMatrix = {{a}};
    double [][] secondMatrix = {{b}};

    return Algebra.DEFAULT.mult(new DenseDoubleMatrix2D(firstMatrix), new DenseDoubleMatrix2D(secondMatrix)).getQuick(0, 0);
  }
}
