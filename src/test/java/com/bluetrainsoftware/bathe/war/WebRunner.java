package com.bluetrainsoftware.bathe.war;

import bathe.BatheBooter;
import nz.ac.auckland.war.WebAppRunner;
import org.junit.Test;

import java.io.IOException;
import java.net.URLClassLoader;

/**
 * @author Richard Vowles - https://plus.google.com/+RichardVowles
 */
public class WebRunner {
	@Test
	public void webRun() throws IOException {
		new BatheBooter().runWithLoader((URLClassLoader)getClass().getClassLoader(), null, WebAppRunner.class.getName(), new String[]{"-Pclasspath:/war.properties"});
	}
}
