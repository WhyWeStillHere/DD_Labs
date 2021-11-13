package calculator;

import java.io.IOException;
import java.util.logging.LogManager;
import java.util.logging.Logger;

public class Main {
  private static Logger logger = Logger.getLogger(Main.class.getName());

  public static void main(String[] args) {
    double a = 2;
    double b = 2;

    logger.info(String.format("Result of %.2f * %.2f: %.2f", a, b, AdvancedCalculator.mult(a, b)));
  }
}
