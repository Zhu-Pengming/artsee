import 'package:flutter/material.dart';

import '../theme/artsee_ui_colors.dart';
import 'common.dart';

class ArtseeSegmentTab {
  final String label;
  final IconData icon;

  const ArtseeSegmentTab({
    required this.label,
    required this.icon,
  });
}

class ArtseeSegmentedTabs extends StatelessWidget {
  final TabController controller;
  final List<ArtseeSegmentTab> tabs;
  final double labelFontSize;
  final double iconSize;
  final double height;

  const ArtseeSegmentedTabs({
    super.key,
    required this.controller,
    required this.tabs,
    this.labelFontSize = 11.5,
    this.iconSize = 13,
    this.height = 38,
  });

  @override
  Widget build(BuildContext context) {
    final activeColor = Theme.of(context).brightness == Brightness.dark
        ? kCobaltMuted
        : kCobalt;

    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: context.artC.silver.withValues(alpha: 0.22),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: context.artC.silver.withValues(alpha: 0.18)),
      ),
      child: TabBar(
        controller: controller,
        indicator: BoxDecoration(
          color: context.artC.cardIconBg,
          borderRadius: BorderRadius.circular(11),
          boxShadow: [
            BoxShadow(
              color: context.artC.ink.withValues(alpha: 0.035),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        labelColor: activeColor,
        unselectedLabelColor: context.artC.ink.withValues(alpha: 0.44),
        labelStyle: TextStyle(
          fontSize: labelFontSize,
          fontWeight: FontWeight.w900,
          letterSpacing: 0,
        ),
        unselectedLabelStyle: TextStyle(
          fontSize: labelFontSize,
          fontWeight: FontWeight.w800,
          letterSpacing: 0,
        ),
        tabs: tabs
            .map(
              (tab) => Tab(
                height: height,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(tab.icon, size: iconSize),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        tab.label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class ArtseeSurface extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final double radius;
  final Color? color;
  final VoidCallback? onTap;
  final bool elevated;

  const ArtseeSurface({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.radius = 18,
    this.color,
    this.onTap,
    this.elevated = false,
  });

  @override
  Widget build(BuildContext context) {
    final decoration = BoxDecoration(
      color: color ?? context.artC.cardIconBg,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(color: context.artC.silver.withValues(alpha: 0.34)),
      boxShadow: elevated
          ? [
              BoxShadow(
                color: context.artC.ink.withValues(alpha: 0.035),
                blurRadius: 14,
                offset: const Offset(0, 6),
              ),
            ]
          : null,
    );

    final content = Container(
      padding: padding,
      decoration: decoration,
      child: child,
    );

    if (onTap == null) return content;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(radius),
        child: content,
      ),
    );
  }
}
