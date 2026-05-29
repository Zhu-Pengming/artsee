import 'package:flutter/material.dart';
import '../../widgets/common.dart';
import '../../services/backend_api_service.dart';
import 'package:artsee_app/theme/artsee_ui_colors.dart';

class EventListScreen extends StatefulWidget {
  const EventListScreen({super.key});

  @override
  State<EventListScreen> createState() => _EventListScreenState();
}

class _EventListScreenState extends State<EventListScreen> {
  List<Map<String, dynamic>> _events = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    setState(() => _loading = true);
    try {
      final result = await BackendApiService.fetchEvents(limit: 30);
      if (mounted) setState(() => _events = result.data);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('加载失败: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = mainTabBottomInset(context);
    return Scaffold(
      backgroundColor: context.artC.porcelain,
      body: SafeArea(
        top: false,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: _loadEvents,
                child: ListView.builder(
                  padding: EdgeInsets.fromLTRB(20, 24, 20, bottom),
                  itemCount: _events.length + 1,
                  itemBuilder: (context, index) {
                    if (index == 0) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 28),
                          Text(
                            '活动',
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w900,
                              color: context.artC.ink,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '顶奢酒店艺术活动中心',
                            style: TextStyle(
                              fontSize: 13,
                              color: context.artC.ink.withOpacity(0.5),
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],
                      );
                    }
                    final event = _events[index - 1];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _EventCard(event: event),
                    );
                  },
                ),
              ),
      ),
    );
  }
}

class _EventCard extends StatelessWidget {
  final Map<String, dynamic> event;

  const _EventCard({required this.event});

  @override
  Widget build(BuildContext context) {
    final title = event['title'] as String? ?? '活动';
    final city = event['city'] as String? ?? '';
    final venue = event['venue'] as String? ?? '';
    final type = event['type'] as String? ?? '';

    return GestureDetector(
      onTap: () {},
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: context.artC.silver.withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: kCobalt.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    type.isNotEmpty ? type : '活动',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: kCobalt,
                    ),
                  ),
                ),
                if (city.isNotEmpty) ...[
                  const SizedBox(width: 8),
                  Icon(Icons.location_on, size: 12, color: context.artC.ink.withOpacity(0.4)),
                  const SizedBox(width: 2),
                  Text(
                    city,
                    style: TextStyle(
                      fontSize: 11,
                      color: context.artC.ink.withOpacity(0.5),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: context.artC.ink,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            if (venue.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                venue,
                style: TextStyle(
                  fontSize: 12,
                  color: context.artC.ink.withOpacity(0.5),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
